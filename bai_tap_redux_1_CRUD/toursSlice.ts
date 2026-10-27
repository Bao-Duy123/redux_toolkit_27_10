import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

// Thay đổi URL này thành đường dẫn Mock API thực tế của bạn (ví dụ: mockapi.io hoặc json-server)
const API = "https://6ac490a854a61668c5f5c48c.mockapi.io/tours"; 

// 1. Cập nhật Interface khớp với dữ liệu JSON
export interface Tour {
  id: string;
  name: string;
  city: string;
  days: number;
  price: number;
  seats: number;
  departure: string;
  image: string;
  isFavorite: boolean;
}

interface ToursState {
  items: Tour[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ToursState = {
  items: [],
  status: "idle",
  error: null,
};

// Hàm tiện ích gọi API
const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Lỗi ${res.status}`);
  return res.json();
};

// --- CÁC THAO TÁC CRUD VỚI MOCK API ---

// 1. READ: Lấy danh sách Tours
export const fetchTours = createAsyncThunk<Tour[]>("tours/fetchTours", async () => {
  return await request<Tour[]>(API);
});

// 2. CREATE: Thêm Tour mới (Bỏ qua id vì Mock API tự động tạo)
export const addTour = createAsyncThunk<Tour, Omit<Tour, "id">>(
  "tours/addTour",
  async (newTour) => {
    return await request<Tour>(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTour),
    });
  }
);

// 3. UPDATE: Cập nhật Tour (Dùng để sửa thông tin hoặc toggle isFavorite)
export const updateTour = createAsyncThunk<Tour, Tour>(
  "tours/updateTour",
  async (tour) => {
    return await request<Tour>(`${API}/${tour.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tour),
    });
  }
);

// 4. DELETE: Xóa Tour theo ID
export const deleteTour = createAsyncThunk<string, string>(
  "tours/deleteTour",
  async (id) => {
    await request(`${API}/${id}`, { method: "DELETE" });
    return id; // Trả về ID để reducer xóa khỏi mảng
  }
);

// --- SLICE CONFIGURATION ---

const toursSlice = createSlice({
  name: "tours",
  initialState,
  reducers: {
    // Bạn có thể viết thêm các reducer nội bộ ở đây (ví dụ: filter, sort)
  },
  extraReducers: (builder) => {
    builder
      // Xử lý READ
      .addCase(fetchTours.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTours.fulfilled, (state, action: PayloadAction<Tour[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTours.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Không thể tải danh sách tour";
      })

      // Xử lý CREATE
      .addCase(addTour.fulfilled, (state, action: PayloadAction<Tour>) => {
        state.items.unshift(action.payload); // Thêm tour mới lên đầu danh sách
      })

      // Xử lý UPDATE
      .addCase(updateTour.fulfilled, (state, action: PayloadAction<Tour>) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // Xử lý DELETE
      .addCase(deleteTour.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export default toursSlice.reducer;

// --- SELECTORS ---
export const selectTours = (state: RootState) => state.tours.items;
export const selectToursStatus = (state: RootState) => state.tours.status;
export const selectToursError = (state: RootState) => state.tours.error;

// Selector tùy chỉnh: Lấy danh sách tour yêu thích
export const selectFavoriteTours = (state: RootState) => 
  state.tours.items.filter((tour) => tour.isFavorite);
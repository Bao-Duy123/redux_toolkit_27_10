// TourManager.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, ActivityIndicator } from "react-native";
import { useAppDispatch, useAppSelector } from "./store";
import { fetchTours, addTour, updateTour, deleteTour, selectTours, selectToursStatus, Tour } from "./toursSlice";

export default function TourManager() {
  const dispatch = useAppDispatch();
  const tours = useAppSelector(selectTours);
  const status = useAppSelector(selectToursStatus);

  // State cho form
  const [name, setName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  
  // State lưu trữ dữ liệu đang chỉnh sửa
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  // 1. READ: Tự động gọi fetchTours khi mở màn hình
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTours());
    }
  }, [status, dispatch]);

  // Xử lý Hủy nhập liệu
  const resetForm = () => {
    setName("");
    setCity("");
    setPrice("");
    setEditingTour(null);
  };

  // 2 & 3. CREATE & UPDATE: Xử lý submit form
  const handleSubmit = async () => {
    if (!name.trim() || !city.trim() || !price) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ Tên, Thành phố và Giá.");
      return;
    }

    try {
      if (editingTour) {
        // Cập nhật (giữ nguyên các trường không có trong form như image, seats...)
        await dispatch(updateTour({
          ...editingTour,
          name,
          city,
          price: Number(price),
        })).unwrap();
      } else {
        // Thêm mới (gán giá trị mặc định cho các trường còn thiếu)
        await dispatch(addTour({
          name,
          city,
          price: Number(price),
          days: 1,
          seats: 20,
          departure: "Đà Nẵng",
          image: "https://picsum.photos/id/14/640/420", // Ảnh mặc định
          isFavorite: false
        })).unwrap();
      }
      resetForm();
    } catch (err: any) {
      Alert.alert("Thao tác thất bại", err.message);
    }
  };

  // Kích hoạt chế độ Sửa
  const startEdit = (tour: Tour) => {
    setEditingTour(tour);
    setName(tour.name);
    setCity(tour.city);
    setPrice(tour.price.toString());
  };

  // Cấu trúc 1 item trong danh sách
  const renderItem = ({ item }: { item: Tour }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.city} | Giá: {item.price.toLocaleString("vi-VN")}đ</Text>
        
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={() => startEdit(item)}>
            <Text style={styles.btnText}>Sửa</Text>
          </TouchableOpacity>
          {/* 4. DELETE: Xóa tour */}
          <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={() => dispatch(deleteTour(item.id))}>
            <Text style={styles.btnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>{editingTour ? "Cập nhật Tour" : "Thêm Tour Mới"}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tên tour (VD: Đêm phố cổ)..." />
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Thành phố (VD: Hội An)..." />
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Giá (VD: 750000)..." keyboardType="numeric" />
        
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.btnText}>{editingTour ? "Lưu Cập Nhật" : "Thêm Tour"}</Text>
        </TouchableOpacity>
        
        {editingTour && (
          <TouchableOpacity style={[styles.submitBtn, styles.cancelBtn]} onPress={resetForm}>
            <Text style={styles.btnText}>Hủy</Text>
          </TouchableOpacity>
        )}
      </View>

      {status === "loading" ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tours}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, paddingTop: 50, backgroundColor: "#f8f9fa" },
  form: { backgroundColor: "#fff", padding: 15, borderRadius: 10, elevation: 3, marginBottom: 15 },
  formTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5, marginBottom: 10, backgroundColor: "#fff" },
  submitBtn: { backgroundColor: "#007BFF", padding: 12, borderRadius: 5, alignItems: "center", marginBottom: 5 },
  cancelBtn: { backgroundColor: "#6c757d" },
  list: { paddingBottom: 20 },
  card: { flexDirection: "row", backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 12, elevation: 2 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
  info: { flex: 1, justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 8 },
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, padding: 8, borderRadius: 5, alignItems: "center" },
  btnEdit: { backgroundColor: "#ffc107" },
  btnDelete: { backgroundColor: "#dc3545" },
  btnText: { color: "#fff", fontWeight: "bold" }
});
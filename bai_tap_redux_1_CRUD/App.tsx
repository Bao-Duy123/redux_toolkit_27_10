import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store'; // Thay đổi đường dẫn này nếu file store.ts nằm ở thư mục khác
import TourManager from './TourManager'; 

export default function App() {
  return (
    <Provider store={store}>
      {/* Bọc PostManager hoặc các Navigation Container bên trong Provider */}
      <TourManager />
    </Provider>
  );
}
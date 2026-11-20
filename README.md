# Thư viện tri thức và tư liệu Kitô giáo Đông phương

Website: https://kitogiaodongphuong.github.io

## Cách đăng một bài viết mới

1. Trên GitHub, mở thư mục `posts`, bấm **Add file → Create new file**.
2. Đặt tên file không dấu, ví dụ `nui-athos-2.md` (tên này sẽ thành địa chỉ bài viết).
3. Dán mẫu sau vào và sửa lại:

```
---
title: Tiêu đề bài viết
date: 2026-11-25
category: Thần học
tags: [Thần học, Linh đạo và đời sống thiêng liêng]
summary: Một hai câu mô tả ngắn hiện ở trang chủ.
image: https://địa-chỉ-ảnh.jpg        (không bắt buộc)
image_position: center 30%            (không bắt buộc, chỉnh phần ảnh được giữ lại khi bị cắt khung, dùng cho ảnh khổ dọc)
image_credit: 'Ảnh: tên tác giả'      (không bắt buộc)
---

Nội dung bài viết viết ở đây.

## Một đề mục

Đoạn văn tiếp theo. **In đậm**, *in nghiêng*, [liên kết](https://example.com).
```

4. Bấm **Commit changes**. Khoảng 1 phút sau bài xuất hiện trên website.

`category` phải đúng một trong các chuyên mục trong file `site.json`.
`tags` chỉ được ghi tên các chuyên mục có sẵn (đúng từng chữ), mỗi nhãn là một chuyên mục khác mà bài cũng thuộc về; bài sẽ hiện ở cả các chuyên mục đó và nhãn bấm vào được. Ghi sai tên, web sẽ báo lỗi và liệt kê tên đúng.
Mục lục tự động được tạo từ các dòng `##` (và `###`) trong bài, chỉ hiện khi bài có từ 3 đề mục `##` trở lên.
Muốn ẩn một bài chưa xong, thêm dòng `draft: true`.

## Các file khác

- `site.json`: tên website, câu trích, danh sách chuyên mục.
- `data/thuat-ngu.json`: danh sách thuật ngữ.
- `pages/gioi-thieu.md`: trang Giới thiệu.
- `assets/style.css`: giao diện.

## Khung nội dung bổ trợ trong bài

Để chèn khung "Bối cảnh", "Thuật ngữ" hoặc "Tư liệu nguyên văn" vào giữa bài, dán đoạn sau (chừa dòng trống như mẫu). Loại khung đổi bằng chữ sau `khung`: để trống (Bối cảnh), `thuat-ngu` (Thuật ngữ) hoặc `tu-lieu` (Tư liệu).

```
<aside class="khung thuat-ngu">

<p class="khung-nhan">Thuật ngữ</p>

*Filioque* là cụm từ Latinh có nghĩa là “và từ Chúa Con”.

</aside>
```

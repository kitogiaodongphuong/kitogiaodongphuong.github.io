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
tags: [Thần học, Linh đạo]
summary: Một hai câu mô tả ngắn hiện ở trang chủ.
image: https://địa-chỉ-ảnh.jpg        (không bắt buộc)
image_credit: 'Ảnh: tên tác giả'      (không bắt buộc)
---

Nội dung bài viết viết ở đây.

## Một đề mục

Đoạn văn tiếp theo. **In đậm**, *in nghiêng*, [liên kết](https://example.com).
```

4. Bấm **Commit changes**. Khoảng 1 phút sau bài xuất hiện trên website.

`category` phải đúng một trong các chuyên mục trong file `site.json`.
Muốn ẩn một bài chưa xong, thêm dòng `draft: true`.

## Các file khác

- `site.json`: tên website, câu trích, danh sách chuyên mục.
- `data/thuat-ngu.json`: danh sách thuật ngữ.
- `pages/gioi-thieu.md`: trang Giới thiệu.
- `assets/style.css`: giao diện.

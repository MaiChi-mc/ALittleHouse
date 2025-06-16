# Database - A Little House 🗃

Cấu trúc cơ sở dữ liệu cho hệ thống khách sạn "A Little House".

## Hệ quản trị cơ sở dữ liệu

- T-SQL

## File bao gồm

- `init.sql`: Tạo bảng, ràng buộc, v.v.
- `sample_data.sql`: Dữ liệu mẫu
- `schema.png`: Hình ERD mô tả cấu trúc DB

## Cách chạy local

- Sử dụng DBeaver / pgAdmin để import file SQL
- Hoặc dùng dòng lệnh:

```bash
psql -U your_user -d your_db -f init.sql

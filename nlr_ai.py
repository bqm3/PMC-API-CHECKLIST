import nltk
import re

# Tải các dữ liệu cần thiết từ NLTK
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('wordnet')
nltk.download('omw-1.4')

# key tìm kiếm
keys=["so sánh","tìm kiếm", "tìm", "lọc", "lấy", "chọn", "hiển thị", "tỷ lệ", "bao nhiêu", "số lượng", "bao nhiêu", "hoàn thành", "top"]
querys=["tăng dần", "thấp dần", "bằng"]

# Các khối
blocks = ["khối bảo vệ", "khối kỹ thuật", "khối an ninh", "khối làm sạch", "khối dịch vụ",
          "khối F&B", "khối FB", "FB", "an ninh", "kỹ thuật", "làm sạch", "dịch vụ" ]

# Các dự án
projects = ["dự án", "tất cả dự án"]

# Các tháng và năm
months = [f"tháng {i}" for i in range(1, 13)]
years = [str(year) for year in range(2000, 2100)]

# Hàm phân tích câu hỏi đơn giản
def extract_keys(text):
    # key lọc
    found_keys = next((k for k in keys if k in text), None)
    # Tìm kiếm khối
    found_block = next((b for b in blocks if b in text), None)
    # Tìm kiếm dự án
    found_project = next((p for p in projects if p in text), None)
    # Tìm tháng
    found_month = next((m for m in months if m in text), None)
    # Tìm năm
    found_year = next((y for y in years if y in text), None)

    # Kết quả phân tích
    return {
        "keys": found_keys,  # Có thể là None nếu không có dự án
        "project": found_project,  # Có thể là None nếu không có dự án
        "block": found_block,      # Có thể là None nếu không có khối
        "month": found_month,      # Có thể là None nếu không có tháng
        "year": found_year         # Có thể là None nếu không có năm
    }

# Hàm phân tích so sánh
def extract_comparison_keys(text):
    # key lọc
    found_keys = next((k for k in keys if k in text), None)
    # Tìm tất cả khối xuất hiện trong câu hỏi
    found_blocks = next((b for b in blocks if b in text), None)
    # Tìm kiếm dự án
    found_project = next((p for p in projects if p in text), None)
    # Tìm tháng và năm
    found_month = next((m for m in months if m in text), None)
    found_year = next((y for y in years if y in text), None)

    # Kết quả phân tích
    return {
        "keys": found_keys,  # Có thể là None nếu không có dự án
        "project": found_project,  # Có thể là None nếu không có dự án
        "block": found_blocks,      # Có thể là None nếu không có khối
        "month": found_month,      # Có thể là None nếu không có tháng
        "year": found_year         # Có thể là None nếu không có năm
    }

# Hàm xây dựng SQL từ kết quả phân tích
def build_comparison_sql(keys):
    base_query = "SELECT Tenkhoi, SUM(Tilehoanthanh) AS TongTile, COUNT(*) AS SoLuongChecklist FROM nrl_ai WHERE isDelete = 0"
    
    # Điều kiện thời gian
    if keys['month']:
        month_number = re.search(r'\d+', keys['month']).group()
        base_query += f" AND MONTH(Ngay) = {month_number}"
    if keys['year']:
        base_query += f" AND YEAR(Ngay) = {keys['year']}"
    
    # Điều kiện cho từng khối
    if keys['blocks']:
        block_conditions = " OR ".join([f"Tenkhoi = '{block}'" for block in keys['blocks']])
        base_query += f" AND ({block_conditions})"
    
    # Tìm các từ khóa so sánh (nếu có)
    if "so sánh" in keys['keys']:
        base_query += " GROUP BY Tenkhoi ORDER BY TongTile DESC"
    else:
        base_query += " GROUP BY Tenkhoi"

    return base_query

# Test với các câu hỏi khác nhau
questions = [
    "Tỷ lệ hoàn thành checklist khối bảo vệ trong tháng 11 là bao nhiêu?",
    "Dự án Ruby trong tháng 11 có tỷ lệ hoàn thành bao nhiêu?",
    "Tháng 11 năm 2024 có bao nhiêu checklist hoàn thành?",
    "Danh sách checklist hoàn thành trong tháng này."
    "Có bao nhiêu dự án không đạt tỉ lệ hoàn thành trên 50%",
    "So sánh tỉ lệ checklist của khối làm sạch và khối kỹ thuật",
    "So sánh tỉ lệ checklist của khối làm sạch và khối kỹ thuật trong năm 2024",
    "Phần trăm hoàn thành của khối bảo vệ và kỹ thuật",
    "Phần trăm hoàn thành của tất cả các khối",
    "Số lượng dự án đã checklist trong ngày hôm nay", 
    "Số lượng dự án đã checklist trong 1 tuần trước",
    "Dự án nào có tỉ lệ checklist hoàn thành cao nhất",
    "Dự án nào có tỉ lệ checklist hoàn thành thấp nhất"
]

# Phân tích câu hỏi so sánh
for question in questions:
    keys = extract_comparison_keys(question.lower())
    # sql_query = build_comparison_sql(keys)
    print(f"=================================")
    print(f"Câu hỏi: {question}")
    print(f"Query: {keys}")
    # print(f"SQL: {sql_query}\n")

# Xây dựng SQL từ kết quả phân tích
# sql_query = build_comparison_sql(keys)
# print(f"SQL truy vấn: {sql_query}")

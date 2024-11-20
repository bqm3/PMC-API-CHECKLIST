import nltk
import re
from datetime import datetime, timedelta

# Tải các dữ liệu cần thiết từ NLTK
nltk.download('punkt')

# Các từ khóa phân loại câu hỏi
quantity_keywords = ["bao nhiêu", "số lượng", "tỷ lệ", "phần trăm"]
time_keywords = ["hôm nay", "tuần này", "tháng này", "năm này", "tháng", "tuần", "ngày"]
comparison_keywords = ["so sánh", "giữa", "tỷ lệ"]
blocks = ["khối bảo vệ", "khối kỹ thuật", "khối làm sạch", "khối F&B", "khối FB", "an ninh", "dịch vụ"]
projects = ["dự án"]
months = [f"tháng {i}" for i in range(1, 13)]
years = [str(year) for year in range(2000, 2100)]

# Hàm phân tích câu hỏi
def extract_comparison_keys(text):
    found_keywords = {}
    
    # Tìm kiếm các từ khóa theo nhóm
    found_keywords["quantity"] = [k for k in quantity_keywords if k in text]
    found_keywords["time"] = [k for k in time_keywords if k in text]
    found_keywords["comparison"] = [k for k in comparison_keywords if k in text]
    
    # Tìm các khối và dự án
    found_blocks = [b for b in blocks if b in text]
    found_projects = [p for p in projects if p in text]
    
    # Tìm tháng và năm
    found_month = next((m for m in months if m in text), None)
    found_year = next((y for y in years if y in text), None)
    
    return {
        "keywords": found_keywords,
        "blocks": found_blocks,
        "projects": found_projects,
        "month": found_month,
        "year": found_year
    }

# Hàm xây dựng SQL cho câu hỏi
def build_sql(keys):
    base_query = "SELECT Tenkhoi, SUM(Tilehoanthanh) / COUNT(*) AS TiLeHoanThanh FROM nrl_ai WHERE isDelete = 0"
    
    # Điều kiện cho các từ khóa thời gian
    if "hôm nay" in keys['keywords']['time']:
        base_query += " AND DAY(Ngay) = DAY(CURDATE())"
    
    if "tuần này" in keys['keywords']['time']:
        start_of_week = datetime.now() - timedelta(days=datetime.now().weekday())
        end_of_week = start_of_week + timedelta(days=6)
        base_query += f" AND Ngay BETWEEN '{start_of_week.strftime('%Y-%m-%d')}' AND '{end_of_week.strftime('%Y-%m-%d')}'"
    
    if keys['month']:
        month_number = re.search(r'\d+', keys['month']).group()
        base_query += f" AND MONTH(Ngay) = {month_number}"
    
    if keys['year']:
        base_query += f" AND YEAR(Ngay) = {keys['year']}"
    
    # Điều kiện cho các khối
    if keys['blocks']:
        block_conditions = " OR ".join([f"Tenkhoi = '{block}'" for block in keys['blocks']])
        base_query += f" AND ({block_conditions})"
    
    # Điều kiện cho các dự án nếu có
    if keys['projects']:
        project_conditions = " OR ".join([f"Duan = '{project}'" for project in keys['projects']])
        base_query += f" AND ({project_conditions})"
    
    # Điều kiện cho các câu hỏi số lượng hoặc tỷ lệ
    if "số lượng" in keys['keywords']['quantity']:
        base_query = base_query.replace("SUM(Tilehoanthanh) / COUNT(*) AS TiLeHoanThanh", "COUNT(*) AS SoLuongChecklist")
    elif "tỷ lệ" in keys['keywords']['quantity']:
        base_query = base_query.replace("SUM(Tilehoanthanh) / COUNT(*) AS TiLeHoanThanh", "SUM(Tilehoanthanh) / COUNT(*) AS TiLeHoanThanh")
    
    # Sắp xếp theo tỷ lệ hoàn thành
    base_query += " GROUP BY Tenkhoi ORDER BY TiLeHoanThanh DESC"
    
    return base_query
# Báo cáo tình trạng của tủ điện 
# Tỉ lệ hoàn thành của khối kỹ thuật trong ca sáng ngày hôm nay là bao nhiêu
# người A ca sáng thực hiện được bao nhiêu checklist
# Tổng hợp các checklist lỗi ngày hôm trước
# Tổng hợp các sự cố chưa được xử lý
# Có bao nhiêu người thực hiện checklist trong ngày hôm nay
# Danh sách câu hỏi
questions = [
    "Tỷ lệ hoàn thành checklist khối bảo vệ trong tháng 11 là bao nhiêu?",
    "Dự án Ruby trong tháng 11 có tỷ lệ hoàn thành bao nhiêu?",
    "Tháng 11 năm 2024 có bao nhiêu checklist hoàn thành?",
    "Danh sách checklist hoàn thành trong tháng này.",
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

# Phân tích các câu hỏi và tạo SQL
for question in questions:
    print(f"Câu hỏi: {question}")
    keys = extract_comparison_keys(question.lower())  # Phân tích câu hỏi
    print(f"Kết quả phân tích câu hỏi: {keys}")
    
    # Xây dựng SQL từ kết quả phân tích
    sql_query = build_sql(keys)
    print(f"SQL truy vấn: {sql_query}")
    print("="*50)

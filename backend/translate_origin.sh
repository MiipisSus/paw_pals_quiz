#!/bin/bash

# 腳本功能：將 origin 重命名為 origin_zh，並翻譯成 origin_en
# 使用 Google Translate 進行翻譯

set -e  # 遇到錯誤立即退出

echo "🌐 開始處理 origin 欄位重命名和翻譯..."

# 設定路徑
BACKEND_DIR="/Users/mango/mango/midogshop/backend"
INPUT_FILE="$BACKEND_DIR/breed_info_bilingual.json"
OUTPUT_FILE="$BACKEND_DIR/breed_info_with_origin.json"

# 檢查輸入檔案是否存在
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ 找不到輸入檔案: $INPUT_FILE"
    exit 1
fi

echo "📁 輸入檔案: $INPUT_FILE"
echo "📁 輸出檔案: $OUTPUT_FILE"

# 進入後端目錄
cd "$BACKEND_DIR"

# 檢查並安裝 googletrans 套件
echo "🔧 檢查 googletrans 套件..."
if ! uv run python -c "import googletrans" 2>/dev/null; then
    echo "📦 安裝 googletrans 套件..."
    uv add googletrans==4.0.0rc1
fi

# 創建 Python 腳本來處理翻譯
cat > temp_origin_processor.py << 'EOF'
import json
import time
from googletrans import Translator

def translate_origin(chinese_origin: str) -> str:
    """使用 Google Translate 將中文原產地翻譯為英文"""
    try:
        translator = Translator()
        
        # 翻譯中文到英文
        result = translator.translate(chinese_origin, src='zh-tw', dest='en')
        
        # 清理翻譯結果
        translation = result.text.strip()
        
        print(f"✅ 翻譯: {chinese_origin} -> {translation}")
        return translation
        
    except Exception as e:
        print(f"❌ 翻譯失敗 ({chinese_origin}): {e}")
        # 如果翻譯失敗，嘗試簡單的映射
        mapping = {
            "德國": "Germany",
            "美國": "United States",
            "英國": "United Kingdom", 
            "法國": "France",
            "澳大利亞": "Australia",
            "日本": "Japan",
            "中國": "China",
            "印度": "India",
            "俄羅斯": "Russia",
            "瑞士": "Switzerland",
            "比利時": "Belgium",
            "荷蘭": "Netherlands",
            "芬蘭": "Finland",
            "挪威": "Norway",
            "匈牙利": "Hungary",
            "西藏": "Tibet",
            "蘇格蘭": "Scotland",
            "威爾士": "Wales",
            "愛爾蘭": "Ireland",
            "西班牙": "Spain",
            "義大利": "Italy",
            "馬爾他": "Malta",
            "馬達加斯加": "Madagascar",
            "墨西哥": "Mexico",
            "古巴": "Cuba",
            "非洲": "Africa",
            "西非": "West Africa",
            "南非": "South Africa",
            "埃及": "Egypt"
        }
        
        return mapping.get(chinese_origin, chinese_origin)

def process_origin_fields(input_file: str, output_file: str):
    """處理 origin 欄位重命名和翻譯"""
    try:
        # 讀取原始 JSON 檔案
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'breed_info' not in data:
            print("❌ JSON 檔案格式不正確，找不到 'breed_info' 欄位")
            return
        
        successful_count = 0
        failed_count = 0
        failed_breeds = []
        
        # 處理每個犬種的原產地
        for i, breed in enumerate(data['breed_info'], 1):
            breed_name = breed.get('english_name', '')
            origin_zh = breed.get('origin', '')
            
            print(f"[{i}/{len(data['breed_info'])}] 處理: {breed_name}")
            
            if origin_zh:
                # 重命名 origin 為 origin_zh
                breed['origin_zh'] = origin_zh
                
                # 翻譯為英文
                origin_en = translate_origin(origin_zh)
                breed['origin_en'] = origin_en
                
                # 移除舊的 origin 欄位
                if 'origin' in breed:
                    del breed['origin']
                
                successful_count += 1
            else:
                breed['origin_zh'] = ""
                breed['origin_en'] = ""
                if 'origin' in breed:
                    del breed['origin']
                failed_count += 1
                failed_breeds.append(breed_name)
            
            # 避免 API 限制，每次請求間隔 0.5 秒
            time.sleep(0.5)
        
        # 更新統計資訊
        data['origin_processing_info'] = {
            'processed_at': time.strftime("%Y-%m-%d %H:%M:%S"),
            'total_breeds': len(data['breed_info']),
            'successful_translations': successful_count,
            'failed_translations': failed_count,
            'failed_breeds': failed_breeds,
            'note': '已將 origin 重命名為 origin_zh 並翻譯為 origin_en'
        }
        
        # 寫入新的 JSON 檔案
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n🎉 處理完成！")
        print(f"📁 輸出檔案: {output_file}")
        print(f"✅ 成功處理: {successful_count} 個犬種")
        print(f"❌ 處理失敗: {failed_count} 個犬種")
        
        if failed_breeds:
            print(f"\n處理失敗的犬種:")
            for breed in failed_breeds[:10]:  # 只顯示前 10 個
                print(f"  - {breed}")
            if len(failed_breeds) > 10:
                print(f"  ... 還有 {len(failed_breeds) - 10} 個")
        
    except Exception as e:
        print(f"❌ 處理檔案時發生錯誤: {e}")

def main():
    input_file = "/Users/mango/mango/midogshop/backend/breed_info_bilingual.json"
    output_file = "/Users/mango/mango/midogshop/backend/breed_info_with_origin.json"
    
    print("🔄 開始 origin 欄位處理...")
    process_origin_fields(input_file, output_file)

if __name__ == "__main__":
    main()
EOF

echo "🔧 開始執行 origin 處理腳本..."

# 使用 uv 執行 Python 腳本
uv run python temp_origin_processor.py

# 清理臨時檔案
rm temp_origin_processor.py

echo "✨ Origin 處理腳本執行完成！"
echo "📁 請查看輸出檔案: $OUTPUT_FILE"

# 顯示簡單統計
if [ -f "$OUTPUT_FILE" ]; then
    echo ""
    echo "📊 檔案統計:"
    echo "   檔案大小: $(ls -lh "$OUTPUT_FILE" | awk '{print $5}')"
    echo "   犬種總數: $(grep -o '"english_name"' "$OUTPUT_FILE" | wc -l | tr -d ' ')"
    echo ""
    echo "📝 新結構包含："
    echo "   - origin_zh: 中文原產地"
    echo "   - origin_en: 英文原產地"
    echo "   - 已移除舊的 origin 欄位"
fi
from sqlalchemy import create_engine, text
import pandas as pd

# Create connection
engine = create_engine('postgresql://postgres:Platoon%401@34.26.64.219:5432/postgres')
conn = engine.connect()

# Get all columns
result = conn.execute(text("""
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'healthcare_production' 
    AND table_name = 'healthcare_providers' 
    ORDER BY ordinal_position
"""))

columns = list(result)

print('\n' + '='*100)
print('HEALTHCARE_PROVIDERS TABLE - ALL COLUMNS')
print('='*100)
print(f'{"#":<5} {"Column Name":<50} {"Data Type":<25} {"Nullable"}')
print('-'*100)

for i, (col_name, data_type, nullable) in enumerate(columns, 1):
    print(f'{i:<5} {col_name:<50} {data_type:<25} {nullable}')

print(f'\nTotal columns: {len(columns)}')

# Check NULL counts for first 100 rows
print('\n' + '='*100)
print('NULL VALUE ANALYSIS (Sample of 100 rows)')
print('='*100)

query = text("""
    SELECT * FROM healthcare_production.healthcare_providers 
    LIMIT 100
""")

df = pd.read_sql(query, conn)

null_counts = df.isnull().sum().sort_values(ascending=True)
print(f'\n{"Column Name":<50} {"NULL Count":<15} {"NULL %"}')
print('-'*100)

for col, null_count in null_counts.items():
    null_pct = (null_count / len(df)) * 100
    print(f'{col:<50} {null_count:<15} {null_pct:>6.1f}%')

# Show columns with least nulls (best to include in CSV)
print('\n' + '='*100)
print('RECOMMENDED COLUMNS FOR CSV EXPORT (Less than 20% NULL values)')
print('='*100)

good_columns = [col for col, count in null_counts.items() if (count / len(df)) < 0.2]
for i, col in enumerate(good_columns, 1):
    print(f'{i:3}. {col}')

conn.close()




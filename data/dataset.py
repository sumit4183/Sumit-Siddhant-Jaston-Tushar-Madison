import pandas as pd

# Load the dataset
file_path = 'original_data.csv'  # Replace with your file path
data = pd.read_csv(file_path)

# Columns to delete
columns_to_delete = ['CO2', 'VAR', 'GEN', 'COU', 'YEA', 'Flag Codes', 'Flags']

# Remove the specified columns if they exist in the dataset
data_cleaned = data.drop(columns=[col for col in columns_to_delete if col in data.columns])

# Remove rows where the 'Gender' column has the value 'Women'
if 'Gender' in data_cleaned.columns:
    data_cleaned = data_cleaned[data_cleaned['Gender'] != 'Women']

# Remove rows with specific values in the 'Variable' column
values_to_remove = [
    "Outflows of foreign population by nationality",
    "Stock of foreign-born population by country of birth",
    "Stock of foreign population by nationality",
    "Acquisition of nationality by country of former nationality"
]

if 'Variable' in data_cleaned.columns:
    data_cleaned = data_cleaned[~data_cleaned['Variable'].isin(values_to_remove)]

# Remove both 'Gender' and 'Variable' columns if they exist
columns_to_drop = ['Gender', 'Variable']
data_cleaned = data_cleaned.drop(columns=[col for col in columns_to_drop if col in data_cleaned.columns])

# Delete rows with the same values in 'Country of birth/nationality' and 'Country'
if 'Country of birth/nationality' in data_cleaned.columns and 'Country' in data_cleaned.columns:
    data_cleaned = data_cleaned[
        data_cleaned['Country of birth/nationality'] != data_cleaned['Country']
    ]
    print("Rows with the same values in 'Country of birth/nationality' and 'Country' have been removed.")
    
# Save the cleaned dataset to a new file
cleaned_file_path = 'sankeyData.csv'  # Replace with your desired output file path
data_cleaned.to_csv(cleaned_file_path, index=False)

# Print unique values in the 'Variable' column
if 'Variable' in data_cleaned.columns:
    unique_values = data_cleaned['Variable'].unique()
    print("Unique values in 'Variable' column:", unique_values)

print(f"Cleaned dataset saved to {cleaned_file_path}")

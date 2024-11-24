import pandas as pd
import csv
from datetime import datetime

#### add question_id

# Load the CSV file
file_path = 'preprocessing/JEOPARDY_CSV.csv'  # Replace with your file path
df = pd.read_csv(file_path)

# Add an index column starting from 0000000
df['index'] = [str(i).zfill(10) for i in range(len(df))]

# Save the updated DataFrame back to a new CSV file
output_path = 'preprocessing/updated_jeopardy.csv'  # Replace with your desired output path
df.to_csv(output_path, index=False)

### convert air_dates to yyyy/mm/dd format

# Input and output file paths
input_file = 'preprocessing/updated_jeopardy.csv'  # Replace with your CSV file name
output_file = 'preprocessing/updated_jeopardy_1.csv'

# Open the input file with the correct encoding
with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames  # Get column headers
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    
    # Write headers to the output file
    writer.writeheader()
    
    # Process each row
    for row in reader:
        # Reformat the date
        original_date = row[' Air_Date']  # Replace 'air_date' with your column name
        reformatted_date = datetime.strptime(original_date, '%m/%d/%y').strftime('%Y-%m-%d')
        row[' Air_Date'] = reformatted_date  # Replace the original date
        writer.writerow(row)

print("CSV file processed successfully!")

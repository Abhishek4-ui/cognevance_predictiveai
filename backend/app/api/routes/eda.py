import os
import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ml_engine.eda.analyzer import EDAAnalyzer

router = APIRouter(prefix="/eda", tags=["Exploratory Data Analysis"])

RAW_DIR = "datasets/raw"

@router.get("/analyze")
def run_eda(filename: str = Query(...), target_column: Optional[str] = Query(None)):
    filepath = os.path.join(RAW_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Dataset {filename} not found")

    df = pd.read_csv(filepath) if filepath.endswith(".csv") else pd.read_excel(filepath)
    analyzer = EDAAnalyzer(df, target_col=target_column)
    eda_results = analyzer.run_full_eda()

    return eda_results

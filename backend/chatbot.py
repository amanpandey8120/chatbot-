from dotenv import load_dotenv
load_dotenv()

# backend/chatbot.py
import os
import pandas as pd
from snowflake_conn import get_conn
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

# Load Snowflake data once
def load_documents_from_snowflake(sql="SELECT * FROM YOUR_TABLE LIMIT 1000", text_column="your_text_column"):
    conn = get_conn()
    df = pd.read_sql(sql, conn)
    conn.close()
    texts = df[text_column].dropna().astype(str).tolist()
    return texts

# Create embeddings + vectorstore + QA chain
def build_qa_chain():
    docs = load_documents_from_snowflake(
        sql=os.getenv("SNOWFLAKE_QUERY", "SELECT * FROM YOUR_TABLE"),
        text_column=os.getenv("SNOWFLAKE_TEXT_COL", "your_text_column")
    )
    # Embeddings
    emb = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
    vs = FAISS.from_texts(docs, emb)
    llm = ChatOpenAI(temperature=0, openai_api_key=os.getenv("OPENAI_API_KEY"))
    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=vs.as_retriever())
    return qa

# Build on import
QA = build_qa_chain()

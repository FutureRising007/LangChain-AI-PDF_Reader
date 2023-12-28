import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeClient } from '@pinecone-database/pinecone';      
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { CharacterTextSplitter } from "langchain/text_splitter";

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
export default async function handler(req, res) {
  if (req.method === "GET") {
    console.log("Inside the PDF handler");
    // Enter your code here
    /** STEP ONE: LOAD DOCUMENT */
    const {bookId} = req.query;
    const bookDb = {
      101: 'D:/INNOVATIONS/AI Based Web Dev/openai-javascript-course/data/document_loaders/the-monk-who-sold-his-ferrari.pdf',
      102: 'D:/INNOVATIONS/AI Based Web Dev/openai-javascript-course/data/document_loaders/bitcoin.pdf'
    }

    const bookPath = bookDb[bookId]; 

    const loader = new PDFLoader(bookPath); 

    const docs = await loader.load();

    console.log(docs); 

    if(docs.length == 0){
      console.log("No documents loaded");
      return;
    }

    const splitter = new CharacterTextSplitter({
      separator: " ", 
      chunkSize: 250,
      chunkOverlap: 10, 
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Chunk it

    // Reduce the size of the metadata

    const reduceDocs = splitDocs.map((doc) => {
      const reducedMetadata = { ...doc.metadata }; 
      delete reducedMetadata.pdf;
      return new Document({
        pageContent: doc.pageContent,
        metadata: reducedMetadata,
      });
    });

    /** STEP TWO: UPLOAD TO DATABASE */
 
    const pinecone = new PineconeClient();

    await pinecone.init({
      apiKey : process.env.PINECONE_API_KEY, 
      environment : process.env.PINECONE_ENVIRONMENT,
    }); 

    // langchain-js
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX); 

    // upload documents to Pinecone 
    await PineconeStore.fromDocuments(reduceDocs , new OpenAIEmbeddings(), {
        pineconeIndex,
        namespace : bookId.toString(),
    });

    console.log("Successfully uploaded documents");

    // upload documents to Pinecone
    return res.status(200).json({ result: docs });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

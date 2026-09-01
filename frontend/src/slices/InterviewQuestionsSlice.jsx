import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


const initialState={
    data:[],
    loading:true,
    serverError:null
}

export const generateInterviewQuestions=createAsyncThunk("interviewQuestions/generateInterviewQuestions",async(_ ,thunkAPI)=>{
    try{

    }catch(err){
        
    }
})


const InterviewQuestionsSlice = createSlice({
    name:"interviewQuestions",
    initialState,
    reducers:{

    },
    extraReducers:(builder)=>{

    }
})
// start here
"use client"
import React, {useState} from "react";
import PageHeader from "../components/PageHeader.jsx";
import PromptBox from "../components/PromptBox.jsx";
import Title from "../components/Title.jsx";
import TwoColumnLayout from "../components/TwoColumnLayout.jsx";
import ResultWithSources from "../components/ResultWithSources.jsx";
import "../globals.css";
/**
 * 
 * @returns EDITS TO BE MADE  - 
 * 
 * 
 * 1. TEXT BOX MEIN SE TEXT POST HONE KE BAAD CLEAR HO RHA HAI , USSKO FIX KRNA HAI 
 * 2. MAKE THE BOT RESPOND "MAIN EK API HU" IF THE QUESTION GOES OUT OF SCOPE
 * 3. MAKE THE UI RESPONSIVE AS FUCKK
 */

const Memory = () => {

    const [prompt , setPrompt] = useState("")
    const [error , setError] = useState(null)
    const [messages, setMessages] = useState([
        {
        text: "Hi there! What's your name and favourite food?", 
        type: "bot"
        }
    ])

    const [firstMsg , setFirstMsg] = useState(true);

    const handlePromptChange = (e) => {
        setPrompt(e.target.value)
    }

    const handleSubmitPrompt = async () => {
        console.log('sending' , prompt);
        try{

            setMessages((prevMessages) => [
                ...prevMessages,
                {text: prompt , type: "user" , sourceDocuments : null}
            ])

            const response = await fetch("/api/memory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }, 
                body: JSON.stringify({input : prompt , firstMsg})
            })

            if(!response.ok){
                throw new Error(`HTTP Error! Status: ${response.status}`)
            }

            
            setPrompt("")

            // So we don't really reinitialize the chain
            setFirstMsg(false)

            const searchRes = await response.json()

            // Add the bot message 
            setMessages((prevMessages) => [
                ...prevMessages,
                {text: searchRes.output.response , type: "bot" , sourceDocuments : null}
            ])

            
            console.log({searchRes});

            // Clear any old error messages 
            setError("")
        }
        catch(err){
            console.error(err)
            setError(err)
        }
    }

    return (
        <>

            <Title 
                headingText={"Memory"}
                emoji="🧠"
            />
            <TwoColumnLayout 
                leftChildren={<>
                    <PageHeader 
                    heading="I remember everything"
                    boldText= "Step into my world with 'I REMEMBER EVERYTHING' – the ultimate time-travel sidekick!"  
                    description= "Forget forgetting; every nuance of my life is at my fingertips. Welcome to a future where forgetting is an ancient tale and every memory is my eternal echo."
                    
                    />
                </>}

                rightChildren={<>
                    <ResultWithSources messages = {messages} pngFile="brain"/>
                    <PromptBox
                        prompt={prompt}
                        handleSubmit={handleSubmitPrompt}
                        error={error}
                        handlePromptChange={handlePromptChange}/>

                </>}

            />


        </>

    )
}

export default Memory

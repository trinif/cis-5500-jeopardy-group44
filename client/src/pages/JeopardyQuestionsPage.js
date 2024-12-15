import { useEffect, useState } from "react";
import { useAuth } from "../components/Context";
const config = require('../config.json');

export default function JeopardyQuestions() {

    // [total, correct, incorrect]
    const [questionsAnswered, setQuestionsAnswered] = useState([0, 0, 0])

    const [newPage, setNewPage] = useState(false)

    const [questionId, setQuestionId] = useState('')
    const [question, setQuestion] = useState('')
    const [category, setCategory] = useState('')
    const [value, setValue] = useState('')

    const [answer, setAnswer] = useState('')
    const [answerMessage, setAnswerMessage] = useState('')

    const { userId } = useAuth();


    const checkButtonHandler = () => {
        fetch(`https://${config.server_host}/check_answer/${questionId}/${answer}`, {
            method: "POST",
        }).then(res => {
            return res.json()
        }).then(resJson => {
            if (resJson.status == 'Correct') {
                setAnswerMessage('Correct!')
                setQuestionsAnswered(([total, correct, incorrect]) => [
                    total+1,
                    correct+1,
                    incorrect
                ])
                fetch(`https://${config.server_host}/update_user_answer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({userId, questionId, is_correct: 1}),
                })
            } else if (resJson.status == 'Incorrect') {
                setAnswerMessage(`Incorrect! The correct answer is '${resJson.message}'`)
                setQuestionsAnswered(([total, correct, incorrect]) => [
                    total+1,
                    correct,
                    incorrect+1
                ])
                fetch(`https://${config.server_host}/update_user_answer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({userId, questionId, is_correct: 0}),
                })
            }
        }).catch(err => {
            console.log(err)
        })
    }

    const newQuestionButtonHandler = () => {
        setNewPage(!newPage)
    }

    useEffect(() => {
        fetch(`https://${config.server_host}/random`)
            .then(res => {
                return res.json()
            })
            .then(resJson => {
                setQuestionId(resJson.question_id)
                setQuestion(resJson.question)
                setCategory(resJson.category)
                setValue(resJson.value)
                
                setAnswer('')
                setAnswerMessage('')
            });
    }, [newPage])

    return (
        <>
            <p>Number of Questions Answered: {questionsAnswered[0]}</p>
            <p>Number of Correct Questions Answered: {questionsAnswered[1]}</p>
            <p>Number of Incorrect Questions Answered: {questionsAnswered[2]}</p>
            <p>Question: {question}</p>
            <p>Category: {category}</p>
            <p>Value: {value}</p>
            <input type='text' 
                value={answer} 
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        checkButtonHandler();
                    }
                }}>
            </input>
            <button onClick={checkButtonHandler}>Check</button>
            <div>
                {answerMessage && <p>{answerMessage}</p>}
            </div>
            <button onClick={newQuestionButtonHandler}>Get New Question</button>
        </>
    );
}
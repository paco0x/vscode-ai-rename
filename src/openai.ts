import fetch from "node-fetch"
import { Position } from "vscode"

interface Message {
    role: string
    content: string
    index: number
    finish_reason: string
}

interface Choice {
    message: Message
}

interface Error {
    code: string
    message: string
    type: string
    param: string | null
}

interface Response {
    error: Error
    choices: Array<Choice>
}

export async function getRenameSuggestions(
    apiKey: string,
    n: number,
    maxToken: number,
    temperature: number,
    codeText: string,
    symbol: string,
    pos: Position,
) {
    const systemInstruction =
        "You're a coding assistant. I'll give you a bunch of code in {[@@(CODE)@@]} format, CODE is the code you need to analyze. You'll need to give me rename suggestions of the variables or functions in the code. The new name should follow the naming convention of the programming language, and should be a meaningful name based on the context of the code. The new name cannot be conflicted with other names in the scope of the symbol and should be different from the original name."

    const payload = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: systemInstruction,
            },
            {
                role: "user",
                content: `Here's the code: {[@@(${codeText})@@]}. Rename the symbol at the ${pos.line} line, the ${pos.character} character in CODE, the original name is ${symbol}. Only return the new name and put it in double quotes.`,
            },
        ],
        n,
        temperature: temperature,
        max_tokens: maxToken,
        stream: false,
    }
    const data = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    })

    const response: Response = await data.json()
    if (response.error) {
        throw new Error(JSON.stringify(response.error))
    }

    const choices = response.choices.reduce((prev, cur) => {
        const result = cur.message.content.match(/"(\w+)"/)
        return result ? prev.add(result[1]) : prev
    }, new Set<string>())

    return choices
}

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
    const systemMessage =
        "You're a coding assistant. I'll give you a bunch of code in {[@@(CODE)@@]} format, where CODE is the code you need to analyze. Please provide suggestions for renaming the variables or function name. The new names should be meaningful and consistent with the naming conventions used for other names in the same scope, and avoid conflicts with existing variable names. Please ensure that the new names are not identical to the original names."

    const payload = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: systemMessage,
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

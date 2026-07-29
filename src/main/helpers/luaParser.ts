// luaParser.ts
// Parses WoW SavedVariables Lua into JavaScript objects.
//
// Supports:
// - strings
// - numbers
// - booleans
// - nil
// - tables
// - arrays
// - [key] = value
// - key = value
//
// Example:
//
// const parser = new LuaParser(luaText)
// const result = parser.parse()
//
// result:
// {
//   variable: "WarbandyHelperDB",
//   value: { ... }
// }

enum TokenType {
  Identifier,
  String,
  Number,
  Boolean,
  Nil,

  LeftBrace,
  RightBrace,

  LeftBracket,
  RightBracket,

  Equals,
  Comma,

  EOF
}

interface Token {
  type: TokenType
  value?: string
}

interface TableEntry {
  key?: string | number
  value: LuaValue
}

type LuaValue = string | number | boolean | null | LuaValue[] | { [key: string]: LuaValue }

export class LuaParser {
  private tokens: Token[] = []
  private current = 0

  constructor(private input: string) {
    this.tokens = this.tokenize()
  }

  // ============================================
  // PUBLIC
  // ============================================

  parse(): {
    variable: string
    value: LuaValue
  } {
    const variable = this.expect(TokenType.Identifier).value!

    this.expect(TokenType.Equals)

    const value = this.parseValue()

    return {
      variable,
      value
    }
  }

  // ============================================
  // TOKENIZER
  // ============================================

  private tokenize(): Token[] {
    const tokens: Token[] = []
    let i = 0

    while (i < this.input.length) {
      const c = this.input[i]

      // whitespace
      if (/\s/.test(c)) {
        i++
        continue
      }

      // comments
      if (c === '-' && this.input[i + 1] === '-') {
        while (i < this.input.length && this.input[i] !== '\n') {
          i++
        }
        continue
      }

      // braces
      if (c === '{') {
        tokens.push({ type: TokenType.LeftBrace })
        i++
        continue
      }

      if (c === '}') {
        tokens.push({ type: TokenType.RightBrace })
        i++
        continue
      }

      if (c === '[') {
        tokens.push({ type: TokenType.LeftBracket })
        i++
        continue
      }

      if (c === ']') {
        tokens.push({ type: TokenType.RightBracket })
        i++
        continue
      }

      if (c === '=') {
        tokens.push({ type: TokenType.Equals })
        i++
        continue
      }

      if (c === ',') {
        tokens.push({ type: TokenType.Comma })
        i++
        continue
      }

      // strings
      if (c === '"' || c === "'") {
        const quote = c
        i++

        let value = ''

        while (i < this.input.length) {
          const ch = this.input[i]

          if (ch === '\\') {
            value += this.input[i + 1]
            i += 2
            continue
          }

          if (ch === quote) {
            break
          }

          value += ch
          i++
        }

        i++

        tokens.push({
          type: TokenType.String,
          value
        })

        continue
      }

      // numbers
      if (/[0-9\-]/.test(c)) {
        let value = ''

        while (i < this.input.length && /[0-9.\-]/.test(this.input[i])) {
          value += this.input[i]
          i++
        }

        tokens.push({
          type: TokenType.Number,
          value
        })

        continue
      }

      // identifiers
      if (/[a-zA-Z_]/.test(c)) {
        let value = ''

        while (i < this.input.length && /[a-zA-Z0-9_]/.test(this.input[i])) {
          value += this.input[i]
          i++
        }

        if (value === 'true' || value === 'false') {
          tokens.push({
            type: TokenType.Boolean,
            value
          })
        } else if (value === 'nil') {
          tokens.push({
            type: TokenType.Nil
          })
        } else {
          tokens.push({
            type: TokenType.Identifier,
            value
          })
        }

        continue
      }

      throw new Error(`Unexpected character: ${c}`)
    }

    tokens.push({
      type: TokenType.EOF
    })

    return tokens
  }

  // ============================================
  // PARSER
  // ============================================

  private parseValue(): LuaValue {
    const token = this.peek()

    switch (token.type) {
      case TokenType.String:
        return this.advance().value!

      case TokenType.Number:
        return Number(this.advance().value)

      case TokenType.Boolean:
        return this.advance().value === 'true'

      case TokenType.Nil:
        this.advance()
        return null

      case TokenType.LeftBrace:
        return this.parseTable()

      default:
        throw new Error(`Unexpected token: ${TokenType[token.type]}`)
    }
  }

  private parseTable(): LuaValue {
    this.expect(TokenType.LeftBrace)

    const entries: TableEntry[] = []

    while (!this.check(TokenType.RightBrace)) {
      entries.push(this.parseField())

      if (this.check(TokenType.Comma)) {
        this.advance()
      }
    }

    this.expect(TokenType.RightBrace)

    return this.buildTable(entries)
  }

  private parseField(): TableEntry {
    // [key] = value
    if (this.match(TokenType.LeftBracket)) {
      const keyValue = this.parseValue()

      this.expect(TokenType.RightBracket)
      this.expect(TokenType.Equals)

      return {
        key: keyValue as string | number,
        value: this.parseValue()
      }
    }

    // key = value
    if (this.check(TokenType.Identifier) && this.peekNext().type === TokenType.Equals) {
      const key = this.advance().value!

      this.expect(TokenType.Equals)

      return {
        key,
        value: this.parseValue()
      }
    }

    // array value
    return {
      value: this.parseValue()
    }
  }

  private buildTable(entries: TableEntry[]): LuaValue {
    const arrayLike = entries.every((entry, index) => {
      if (entry.key === undefined) {
        return true
      }

      return entry.key === index + 1
    })

    if (arrayLike) {
      return entries.map((e) => e.value)
    }

    const obj: Record<string, LuaValue> = {}

    let arrayIndex = 1

    for (const entry of entries) {
      if (entry.key !== undefined) {
        obj[String(entry.key)] = entry.value
      } else {
        obj[String(arrayIndex++)] = entry.value
      }
    }

    return obj
  }

  // ============================================
  // TOKEN HELPERS
  // ============================================

  private peek(): Token {
    return this.tokens[this.current]
  }

  private peekNext(): Token {
    return this.tokens[this.current + 1]
  }

  private advance(): Token {
    return this.tokens[this.current++]
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance()
      return true
    }

    return false
  }

  private expect(type: TokenType): Token {
    const token = this.peek()

    if (token.type !== type) {
      throw new Error(`Expected ${TokenType[type]}, got ${TokenType[token.type]}`)
    }

    return this.advance()
  }
}

package main

import (
	"fmt"
	"regexp"
	"strings"
)

var (
	REGEX = map[string]string{
		"TYPES_DEFIN": "\\b(NUM|VIRNUM|PAL|SIMNAO)\\b",
		"REP":         "\\b(REP)\\b",
		"ENQ":         "\\b(ENQ)\\b",
		"DUVIDA":      "\\b(DUVIDA)\\b",
		"IMPRIMIR":    "\\b(IMPRIMIR)\\b",
		"FUNCS_CAST":  "\\b(PARAPAL|PARANUM|PARAVIRNUM|PARASIMNAO)\\b",
		"OPER_COND":   "(\\>=|\\<=|\\!=|=|<|>)",
		"OPER_ARIT":   "(\\+|\\-|\\*|\\/)",
		"OPER_LOGIC":  "(\\~|\\^)",
		"OPER_DEFIN":  "¬\\s*\\bISTOEH\\b",
		"ID":          "\\b[a-zA-Z_][a-zA-Z0-9_]*\\b",
		"VIRNUM":      "[0-9][0-9]*,[0-9][0-9]*",
		"NUM":         "[0-9][0-9]*",
		"PAL":         "('([^']*)'|\"([^\"]*)\")",
		"SIMNAO":      "(\\bSIM\\b|\\bNAO\\b)",
		",":           "\\,",
		";":           "\\;",
		":":           "\\:",
		"(":           "\\(",
		")":           "\\)",
		"«":           "«",
		"»":           "»",
	}

	syntaxTable = map[string]map[string][]string{
		"MAIN": {
			"ID":         {"ID", "DECL", "MAIN"},
			"ENQ":        {"FUNCS_COND", "MAIN"},
			"REP":        {"FUNCS_COND", "MAIN"},
			"DUVIDA":     {"FUNCS_COND", "MAIN"},
			"PARANUM":    {"FUNCS_CAST", "MAIN"},
			"PARAVIRNUM": {"FUNCS_CAST", "MAIN"},
			"PARASIMNAO": {"FUNCS_CAST", "MAIN"},
			"IMPRIMIR":   {"IMPRIMIR", "(", "VALUE", "MULTIPLE_PARAM", ")", ";", "MAIN"},
			"ε":          {},
		},
		"DECL": {
			"OPER_DEFIN": {"OPER_DEFIN", "TYPES_DEFIN", "ATRIB", ";"},
			":":          {"ATRIB", ";"},
		},
		"ATRIB": {
			":": {":", "VALUE"},
		},
		"FUNCS_COND": {
			"DUVIDA": {"DUVIDA", "(", "COND", ")", "«", "MAIN", "»"},
			"REP":    {"REP", "(", "COND", ")", "«", "MAIN", "»"},
			"ENQ":    {"ENQ", "(", "COND", ")", "«", "MAIN", "»"},
		},
		"COND": {
			"ID":     {"VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"},
			"NUM":    {"VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"},
			"VIRNUM": {"VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"},
			"PAL":    {"VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"},
			"SIMNAO": {"VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"},
			"ε":      {},
		},
		"VALUE": {
			"ID":         {"ID", "MULTIPLE_ARIT"},
			"NUM":        {"NUM", "MULTIPLE_ARIT"},
			"VIRNUM":     {"VIRNUM", "MULTIPLE_ARIT"},
			"PAL":        {"PAL", "MULTIPLE_ARIT"},
			"SIMNAO":     {"SIMNAO", "MULTIPLE_ARIT"},
			"FUNCS_CAST": {"FUNCS_CAST", "(", "VALUE", ")"},
			"(":          {"FUNC"},
		},
		"FUNC": {
			"(": {"(", "VALUE", "MULTIPLE_PARAM", ")", "«", "MAIN", "»"},
		},
		"OPER_COND": {
			">":  {">"},
			"<":  {"<"},
			">=": {">="},
			"<=": {"<="},
			"=":  {"="},
		},
		"OPER_LOGIC": {
			"ˆ": {"ˆ"},
			"^": {"^"},
			"~": {"~"},
			"ε": {},
		},
		"OPER_ARIT": {
			"+": {"+"},
			"-": {"-"},
			"*": {"*"},
			"/": {"/"},
			"ε": {},
		},
		"MULTIPLE_ARIT": {
			"OPER_ARIT": {"OPER_ARIT", "VALUE", "MULTIPLE_ARIT"},
			"ε":         {},
		},
		"MULTIPLE_COND": {
			"OPER_LOGIC": {"OPER_LOGIC", "COND", "MULTIPLE_COND"},
			"ε":          {},
		},
		"MULTIPLE_PARAM": {
			",": {",", "VALUE", "MULTIPLE_PARAM"},
			"ε": {},
		},
	}
)

type Token struct {
	Token    string
	Value    string
	Position int
}

func tokenize(code string) []Token {
	tokens := make([]Token, 0)
	position := 0
	code = strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(code, "\n", " "), "\t", " "), "\r", " ")
	for position < len(code) {
		matched := false

		for tokenName, pattern := range REGEX {
			reg := regexp.MustCompile(`^` + pattern)
			match := reg.FindStringSubmatch(code[position:])

			if match != nil {
				value := match[0]
				tokens = append(tokens, Token{Token: tokenName, Value: value, Position: position})
				position += len(value)
				matched = true
				break
			}
		}

		if !matched {
			position += 1
		}
	}

	tokens = append(tokens, Token{Token: "$", Value: "$", Position: len(code) + 1})
	return tokens
}

func syntaxAnalyzer(tokenList []Token) bool {
	stack := []string{"$", "MAIN"}
	index := 0
	for len(stack) > 0 || index < len(tokenList) {

		currentSymbol := stack[len(stack)-1]
		currentToken := tokenList[index]
		fmt.Println("Pilha:", stack)
		fmt.Println("Simbolo atual:", currentSymbol)
		fmt.Println("Simbolo recebido:", currentToken.Token)
		fmt.Println("Valor:", currentToken.Value)
		fmt.Println("Posicao:", currentToken.Position)
		fmt.Println("\n")

		if currentSymbol == currentToken.Token {
			fmt.Println("Encontrou o simbolo!")
			stack = stack[:len(stack)-1]
			index++
		} else if _, exists := syntaxTable[currentSymbol]; exists {
			if production, exists := syntaxTable[currentSymbol][currentToken.Token]; exists {
				stack = stack[:len(stack)-1]
				for i := len(production) - 1; i >= 0; i-- {
					fmt.Println("Adicionada a Pilha:", stack)
					stack = append(stack, production[i])
				}
			} else {
				if _, exists := syntaxTable[currentSymbol]["ε"]; exists {
					fmt.Println("Caiu em Epson, recuperação\n")
					stack = stack[:len(stack)-1]
				} else {
					fmt.Println("hehehehe", currentToken)
					fmt.Println("Error: Unexpected token", currentToken.Value, "Position:", currentToken.Position)
					return false
				}
			}
		} else {
			fmt.Println("Error: Invalid symbol in the stack", currentSymbol)
			return false
		}
	}

	if len(stack) == 0 {
		fmt.Println("\n\nEste código é válido!")
		return true
	} else {
		fmt.Println("Error: Syntax analysis failed.")
		return false
	}
}

func main() {
	const code = `
		val1 ¬ ISTOEH NUM: 100;

		qtd ¬ ISTOEH NUM: 12;

		IMPRIMIR("QTD", qtd, "val1", val1);
	`

	tokens := tokenize(code)
	syntaxAnalyzer(tokens)
}

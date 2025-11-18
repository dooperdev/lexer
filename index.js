// Token types
const TokenType = {
  Keyword: "Keyword",
  Identifier: "Identifier",
  Number: "Number",
  String: "String",
  Operator: "Operator",
  Separator: "Separator",
  Comment: "Comment",
  Unknown: "Unknown",
};

// Language rules
const keywords = ["var", "print", "if", "else", "while", "function", "return"];
const operators = ["+", "-", "*", "/", "=", "==", "!=", ">", "<", ">=", "<="];
const separators = [";", "(", ")", "{", "}"];

// Helper functions
function isLetter(char) {
  return /[a-zA-Z]/.test(char);
}
function isDigit(char) {
  return /[0-9]/.test(char);
}
function isWhitespace(char) {
  return /\s/.test(char);
}

// Lexer function
function lexer(code) {
  const tokens = [];
  let pos = 0;

  function current() {
    return code[pos] || null;
  }
  function next() {
    return code[pos + 1] || null;
  }
  function advance(n = 1) {
    pos += n;
  }

  function readNumber() {
    let num = "";
    while (isDigit(current()) || current() === ".") {
      num += current();
      advance();
    }
    return { type: TokenType.Number, value: num };
  }

  function readIdentifier() {
    let id = "";
    while (isLetter(current()) || isDigit(current()) || current() === "_") {
      id += current();
      advance();
    }
    if (keywords.includes(id)) return { type: TokenType.Keyword, value: id };
    return { type: TokenType.Identifier, value: id };
  }

  function readString() {
    const quoteType = current(); // " or '
    let str = quoteType;
    advance();
    while (current() && current() !== quoteType) {
      str += current();
      advance();
    }
    str += current(); // closing quote
    advance();
    return { type: TokenType.String, value: str };
  }

  function readComment() {
    if (current() === "/" && next() === "/") {
      let comment = "";
      while (current() && current() !== "\n") {
        comment += current();
        advance();
      }
      return { type: TokenType.Comment, value: comment };
    } else if (current() === "/" && next() === "*") {
      let comment = "";
      advance(2);
      while (current() && !(current() === "*" && next() === "/")) {
        comment += current();
        advance();
      }
      advance(2); // skip closing */
      return { type: TokenType.Comment, value: comment };
    }
    return null;
  }

  while (current() !== null) {
    if (isWhitespace(current())) {
      advance();
      continue;
    }

    // Comments
    if (current() === "/" && (next() === "/" || next() === "*")) {
      tokens.push(readComment());
      continue;
    }

    // Strings
    if (current() === '"' || current() === "'") {
      tokens.push(readString());
      continue;
    }

    // Numbers
    if (isDigit(current())) {
      tokens.push(readNumber());
      continue;
    }

    // Identifiers/Keywords
    if (isLetter(current()) || current() === "_") {
      tokens.push(readIdentifier());
      continue;
    }

    // Operators (check two-character operators first)
    let twoCharOp = current() + next();
    if (operators.includes(twoCharOp)) {
      tokens.push({ type: TokenType.Operator, value: twoCharOp });
      advance(2);
      continue;
    }
    if (operators.includes(current())) {
      tokens.push({ type: TokenType.Operator, value: current() });
      advance();
      continue;
    }

    // Separators
    if (separators.includes(current())) {
      tokens.push({ type: TokenType.Separator, value: current() });
      advance();
      continue;
    }

    // Unknown
    tokens.push({ type: TokenType.Unknown, value: current() });
    advance();
  }

  return tokens;
}

// Display tokens in table
function displayTokens(tokens) {
  const tbody = document.querySelector("#tokenTable tbody");
  tbody.innerHTML = "";
  tokens.forEach((t) => {
    const tr = document.createElement("tr");
    const tdType = document.createElement("td");
    tdType.textContent = t.type;
    const tdValue = document.createElement("td");
    tdValue.textContent = t.value;
    tr.appendChild(tdType);
    tr.appendChild(tdValue);
    tbody.appendChild(tr);
  });
}

// Button click event
document.getElementById("breakButton").addEventListener("click", () => {
  const code = document.getElementById("codeArea").value;
  const tokens = lexer(code);
  displayTokens(tokens);
});

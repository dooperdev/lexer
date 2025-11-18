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

// Helpers
function isLetter(c) {
  return /[a-zA-Z]/.test(c);
}
function isDigit(c) {
  return /[0-9]/.test(c);
}
function isWhitespace(c) {
  return /\s/.test(c);
}

// DFA states
const State = {
  START: "START",
  IDENTIFIER: "IDENTIFIER",
  NUMBER: "NUMBER",
  STRING: "STRING",
  OPERATOR: "OPERATOR",
  SEPARATOR: "SEPARATOR",
  COMMENT: "COMMENT",
  UNKNOWN: "UNKNOWN",
};

// Lexer function using DFA and state tracking
function lexer(code) {
  const tokens = [];
  const states = []; // to track DFA state per character
  let pos = 0;
  let state = State.START;
  let buffer = "";
  let stringQuote = null;

  const current = () => code[pos] || null;
  const nextChar = () => code[pos + 1] || null;
  const advance = (n = 1) => (pos += n);

  const addToken = (type, value) => tokens.push({ type, value });

  while (current() !== null) {
    const c = current();

    // record current DFA state
    states.push({ char: c, state });

    switch (state) {
      case State.START:
        if (isWhitespace(c)) {
          advance();
        } else if (isLetter(c) || c === "_") {
          buffer = c;
          state = State.IDENTIFIER;
          advance();
        } else if (isDigit(c)) {
          buffer = c;
          state = State.NUMBER;
          advance();
        } else if (c === '"' || c === "'") {
          buffer = c;
          stringQuote = c;
          state = State.STRING;
          advance();
        } else if (c === "/" && (nextChar() === "/" || nextChar() === "*")) {
          buffer = c;
          state = State.COMMENT;
          advance();
        } else if (operators.includes(c + nextChar())) {
          addToken(TokenType.Operator, c + nextChar());
          advance(2);
        } else if (operators.includes(c)) {
          addToken(TokenType.Operator, c);
          advance();
        } else if (separators.includes(c)) {
          addToken(TokenType.Separator, c);
          advance();
        } else {
          addToken(TokenType.Unknown, c);
          advance();
        }
        break;

      case State.IDENTIFIER:
        if (isLetter(c) || isDigit(c) || c === "_") {
          buffer += c;
          advance();
        } else {
          addToken(
            keywords.includes(buffer)
              ? TokenType.Keyword
              : TokenType.Identifier,
            buffer
          );
          buffer = "";
          state = State.START;
        }
        break;

      case State.NUMBER:
        if (isDigit(c) || c === ".") {
          buffer += c;
          advance();
        } else {
          addToken(TokenType.Number, buffer);
          buffer = "";
          state = State.START;
        }
        break;

      case State.STRING:
        buffer += c;
        advance();
        if (c === stringQuote) {
          addToken(TokenType.String, buffer);
          buffer = "";
          stringQuote = null;
          state = State.START;
        }
        break;

      case State.COMMENT:
        if ((buffer === "/" && current() === "/") || buffer.startsWith("//")) {
          while (current() && current() !== "\n") {
            buffer += current();
            advance();
          }
        } else if (buffer === "/" && current() === "*") {
          buffer += "*";
          advance();
          while (current() && !(current() === "*" && nextChar() === "/")) {
            buffer += current();
            advance();
          }
          buffer += "*/";
          advance(2);
        }
        addToken(TokenType.Comment, buffer);
        buffer = "";
        state = State.START;
        break;
    }
  }

  // Final buffer check
  if (state === State.IDENTIFIER)
    addToken(
      keywords.includes(buffer) ? TokenType.Keyword : TokenType.Identifier,
      buffer
    );
  if (state === State.NUMBER) addToken(TokenType.Number, buffer);

  return { tokens, states };
}

// Display tokens in table
function displayTokens(tokens) {
  const tbody = document.querySelector("#tokenTable tbody");
  tbody.innerHTML = "";
  tokens.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${t.type}</td><td>${t.value}</td>`;
    tbody.appendChild(tr);
  });
}

// Display DFA states
function displayStates(states) {
  const existingTable = document.getElementById("dfaTable");
  if (existingTable) existingTable.remove();

  const table = document.createElement("table");
  table.id = "dfaTable";
  table.innerHTML = `
    <thead>
      <tr><th>Character</th><th>DFA State</th></tr>
    </thead>
    <tbody>
      ${states
        .map(
          (s) =>
            `<tr><td>${s.char === "\n" ? "\\n" : s.char}</td><td>${
              s.state
            }</td></tr>`
        )
        .join("")}
    </tbody>
  `;
  document.body.appendChild(table);
}

// Button click event
document.getElementById("breakButton").addEventListener("click", () => {
  const code = document.getElementById("codeArea").value;
  const { tokens, states } = lexer(code);
  displayTokens(tokens);
  displayStates(states);
});

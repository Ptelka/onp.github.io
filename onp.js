const ExpressionType = {
    OPENING_BRACKET: "Nawias otwierający",
    CLOSING_BRACKET: "Nawias zamykający",
    CONSTANT: "Stała",
    OPERATOR: "Operator",
    END: "Koniec",
}

const OperationDescriptions = new Map ([
    [ExpressionType.OPENING_BRACKET, "na stos"],
    [ExpressionType.CLOSING_BRACKET, "przenioś ze stosu operatory dopóki nie znajdziesz nawiasu otwierającego"],
    [ExpressionType.CONSTANT, "dodaj do wyniku"],
    [ExpressionType.OPERATOR, "przenioś ze stosu operatory dopóki nie znajdziesz operatora z mniejszym priorytetem. Dodaj operator na stos"],
    [ExpressionType.END, "Koniec: przenieś wszystko ze stosu do wyniku"]
]);

class Expression {
    constructor(priority, type, value) {
        this.priority = priority;
        this.type = type;
        this.value = value;
    }
}

Expression.prototype.toString = function expressionToString() {
    return `${this.value}`;
};

class Step {
    constructor(expressions, stack, result, expression) {
        this.expressions = expressions;
        this.stack = stack;
        this.result = result;
        this.expression = expression;
    }
}

function isAlphaNumeric(ch) {
    return ch.match(/^[a-z0-9]+$/i) !== null;
}

function extractComplexExpression(input) {
    let result = "";
    for (let character of input) {
        if (!isAlphaNumeric(character)) {
            break;
        }

        result += character;
        if (result === "sin" || result === "tg" || result === "cos" || result === "ctg") {
            return new Expression(4, ExpressionType.OPERATOR, result);
        }
    }

    return result.length > 0 ? new Expression(null, ExpressionType.CONSTANT, result) : null;
}

function createExpression(input) {
    let character = input[0];

    if (character === '(') {
        return new Expression(0, ExpressionType.OPENING_BRACKET, character);
    }

    if (character === ')') {
        return  new Expression(1, ExpressionType.CLOSING_BRACKET, character);
    }

    if (character === '+' || character === '-') {
        return new Expression(1, ExpressionType.OPERATOR, character);
    }

    if (character === '*' || character === '/') {
        return new Expression(2, ExpressionType.OPERATOR, character);
    }

    if (character === '^') {
        return new Expression(3, ExpressionType.OPERATOR, character);
    }

    if (character === '!') {
        return new Expression(4, ExpressionType.OPERATOR, character);
    }

    return extractComplexExpression(input);
}

function parse(input) {
    let expressions = [];

    let i = 0;
    while (i < input.length) {
        let expression = createExpression(input.substr(i));
        if (expression !== null) {
            i += expression.value.length;
            expressions.push(expression);
        } else {
            ++i;
        }
    }

    return expressions;
}

function closingBracketCase(stack) {
    let result = [];
    let val = stack.pop();
    while (val.type !== ExpressionType.OPENING_BRACKET) {
        result.push(val.value);
        val = stack.pop();
    }

    return result;
}

function operatorCase(stack, expression) {
    let result = [];
    while (stack.length > 0 && stack[stack.length - 1].priority >= expression.priority) {
        result.push(stack.pop().value);
    }

    stack.push(expression);

    return result;
}

function lastStep(stack) {
    let result = [];
    while (stack.length > 0) {
        result.push(stack.pop().value);
    }

    return result;
}

function convert(expressions) {
    let steps = [];
    let stack = [];
    let result = [];

    while (expressions.length > 0) {
        let expression = expressions[0];

        switch (expression.type) {
            case ExpressionType.OPENING_BRACKET:
                stack.push(expression);
                break;
            case ExpressionType.CLOSING_BRACKET:
                result = result.concat(closingBracketCase(stack));
                break;
            case ExpressionType.CONSTANT:
                result.push(expression.value);
                break;
            case ExpressionType.OPERATOR:
                result = result.concat(operatorCase(stack, expression));
                break;
        }

        steps.push(new Step(expressions.slice(), stack.slice(), result.slice(), expressions.shift()));
    }

    result = result.concat(lastStep(stack));
    steps.push(new Step(expressions.slice(), stack.slice(), result.slice(), new Expression(null, ExpressionType.END, null)));

    return steps;
}

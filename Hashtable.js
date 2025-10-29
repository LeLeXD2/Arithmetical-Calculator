//this is a hash table used to store variable names and the value
const symbolTable = new Map();

//this node class is the core building stucture for the binary tree
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

//this function is to build a binary expression tree from a postfix expression
function buildBinaryTree(exps) {
    const tkns = exps.split(' ');
    const stack = [];

    tkns.forEach(tkn => {
        //checks if it is a number
        if (!isNaN(tkn)) {
            stack.push(new Node(Number(tkn)));
        } 
        //checks if it is a = (to assign the value to the variable e.g A 3 =)
        else if (tkn === '=') { 
            const valueNode = stack.pop(); //pops the right side (value)
            const varNode = stack.pop();  //pops the left side (variable)

            //error handling in the event varNode is not a variable
            if (typeof varNode.value !== 'string') {
                throw new Error("Left side of assignment must be a variable name.");
            }

            //Calculating to ensure the table keeps from A-Z
            let letters = varNode.value.split('');
            let total = 0;
            for (let i = 0; i < letters.length; i++) {
                if (/^[a-zA-Z]+$/.test(letters[i])) {
                    let let_num = letters[i].toUpperCase().charCodeAt(0) - 65;
                    total += let_num;
                }
                //errpr handling in the event that variable contain numbers
                else {
                    throw new Error("Variable contains numbers!");
                }
            }

            //This calculates the position of where the value should go

            let pos = total % 26;
            const numberToLetter = String.fromCharCode(pos + 65);
            console.log("Value postion of " + varNode.value + " = " + numberToLetter);

            //evaluate the valueNode and store it in the symbol hash table
            const value = evaluateTree(valueNode);
            symbolTable.set(numberToLetter, value);

            //push value as a node so it can continue in chained expressions
            stack.push(new Node(value));
        } 
        //delete the variable beside '#' from the hash table
        else if (tkn === '#') {
            const varNode = stack.pop();
            symbolTable.delete(varNode.value);
        } 
        //push variable to stack list
        else if (/^[a-zA-Z]+$/.test(tkn)) {
            stack.push(new Node(tkn));
        } 
        //assigning the last 2 values from stack list as left and right and create 
        //a node class for the operator
        else {
            const right = stack.pop();
            const left = stack.pop();
            const node = new Node(tkn);
            node.left = left;
            node.right = right;
            stack.push(node);
        }   
    });

    //final expression tree root
    return stack.pop();
}

//this function evaluates the expression tree recursively
function evaluateTree(node) {
    if (!node.left && !node.right) {
        if (typeof node.value === 'number') {
            return node.value;
        } 
        else if (typeof node.value === 'string') {
            if (symbolTable.has(node.value)) {
                return symbolTable.get(node.value);
            } 
            else {
                throw new Error(`Undefined variable: ${node.value}`);
            }
        }
    }

    const left = evaluateTree(node.left);
    const right = evaluateTree(node.right);

    //calculating based on the operator
    switch (node.value) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
        default: throw new Error("Unknown operator: " + node.value);
    }
}

//this function is used to visualize print the binary tree after it is formed
function printTree(node, indent = "", isLeft = true) {
    if (node === null) return;

    if (node.right) {
        printTree(node.right, indent + (isLeft ? "│   " : "    "), false);
    }

    console.log(indent + (isLeft ? "└── " : "┌── ") + node.value);

    if (node.left) {
        printTree(node.left, indent + (isLeft ? "    " : "│   "), true);
    }
}

//this function is to visualize the hashtable
function printHashTable() {
    const entries = [];
    for (const [key, value] of symbolTable.entries()) {
        entries.push(`${key} = ${value}`);
    }
    console.log("Hash Table:");
    console.log(entries.join(', '));
}

//inputs
console.log("Enter arithmetical expressions:");

process.stdin.on('data', (data) => {
    //allows user to quit the loop
    if(data.toString().trim() === 'q'){
        process.exit(); // Exit after getting input
    }

    const tree = buildBinaryTree(data.toString().trim());
    if (!data.includes('#') && !data.includes('=')) {
        const result = evaluateTree(tree);
        printHashTable();
        console.log("Result:", result);
        printTree(tree);
    }
    else {
        printHashTable();
    }
    console.log("Enter arithmetical expressions (q = Quit):");
});
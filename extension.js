const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    const provider = vscode.languages.registerDefinitionProvider(
        { language: 'xml', scheme: 'file' },
        new XmlGuidDefinitionProvider()
    );
    context.subscriptions.push(provider);
}

class XmlGuidDefinitionProvider {
    async provideDefinition(document, position, token) {
        try {
            const range = document.getWordRangeAtPosition(position, /a[0-9a-fA-F-]{36}a/);
            if (!range) return null;
            
            const word = document.getText(range);
            const lineText = document.lineAt(position.line).text;
            
            // 匹配 GuidDef="xxx" 或 SrcGuid="xxx"
            const attrRegex = /(GuidDef|SrcGuid|DestGuid)\s*=\s*"([^"]*)"/g;
            let match;
            let targetGuid = null;

            while ((match = attrRegex.exec(lineText)) !== null) {
                if (match[2] === word) {
                    const startPos = match.index + match[0].indexOf(match[2]);
                    const endPos = startPos + match[2].length;
                    if (position.character >= startPos && position.character <= endPos) {
                        targetGuid = match[2];
                        break;
                    }
                }
            }

            if (!targetGuid) return null;

            const currentFilePath = document.uri.fsPath;
            let searchRoot = path.dirname(currentFilePath);
            
            // 向上回溯4层
            for (let i = 0; i < 4; i++) {
                const parent = path.dirname(searchRoot);
                if (parent === searchRoot) break; 
                searchRoot = parent;
            }

            return await this.findTargetInFiles(searchRoot, targetGuid);

        } catch (e) {
            return null;
        }
    }


async findTargetInFiles(rootPath, targetGuid) {
        const targetRegex = new RegExp(`\\bGuid="${targetGuid}"`); 

        const files = await this.getAllXmlFiles(rootPath);

        for (const file of files) {
            try {
                const content = await fs.promises.readFile(file, 'utf-8');
                
                const match = content.match(targetRegex);

                if (match) {
                    // match.index 是匹配到的起始位置
                    const index = match.index;
                    
                    const preMatch = content.substring(0, index);
                    const lines = preMatch.split('\n');
                    const line = lines.length - 1;
                    const col = lines[lines.length - 1].length;

                    const targetUri = vscode.Uri.file(file);
                    // match[0] 是整个匹配到的字符串 (Guid="xxx")
                    const range = new vscode.Range(line, col, line, col + match[0].length);

                    return new vscode.Location(targetUri, range);
                }
            } catch (err) {
                continue; 
            }
        }
        return null;
    }

    async getAllXmlFiles(dir) {
        let results = [];
        try {
            const list = fs.readdirSync(dir);
            for (const file of list) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) {
                    if (!file.startsWith('.') && file !== 'node_modules') {
                        results = results.concat(await this.getAllXmlFiles(filePath));
                    }
                } else {
                    if (file.toLowerCase().endsWith('.xml')) {
                        results.push(filePath);
                    }
                }
            }
        } catch (e) { }
        return results;
    }
}

function deactivate() {}

module.exports = { activate, deactivate }
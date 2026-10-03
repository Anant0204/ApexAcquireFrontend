const fs = require('fs');
const file = 'd:/Kiaan project/E-state(Nalini-Mam)/ApexAcquireFrontend/src/data/mockData.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/export const INITIAL_CONTACTS: RealtorContact\[\] = \[[\s\S]*?\];\n\nexport const INITIAL_CONVERSATIONS/g, 'export const INITIAL_CONTACTS: RealtorContact[] = [];\n\nexport const INITIAL_CONVERSATIONS');
content = content.replace(/export const INITIAL_CONVERSATIONS: Conversation\[\] = \[[\s\S]*?\];\n\nexport const INITIAL_DEALS/g, 'export const INITIAL_CONVERSATIONS: Conversation[] = [];\n\nexport const INITIAL_DEALS');
content = content.replace(/export const INITIAL_DEALS: PropertyDeal\[\] = \[[\s\S]*?\];\n\nexport const INITIAL_TASKS/g, 'export const INITIAL_DEALS: PropertyDeal[] = [];\n\nexport const INITIAL_TASKS');
content = content.replace(/export const INITIAL_TASKS: CRMTask\[\] = \[[\s\S]*?\];\n\nexport const INITIAL_TEMPLATES/g, 'export const INITIAL_TASKS: CRMTask[] = [];\n\nexport const INITIAL_TEMPLATES');

fs.writeFileSync(file, content);
console.log('Dummy data cleared');

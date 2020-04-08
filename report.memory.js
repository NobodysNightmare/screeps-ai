class MemoryReport {
    report() {
        let result = []
        for(let key in Memory) {
            result.push({ key: key, usage: JSON.stringify(Memory[key]).length });
        }

        for(let line of _.sortBy(result, (l) => -l.usage)) {
            console.log(`${line.key}: ${line.usage}`);
        }
    }
}

module.exports = new  MemoryReport();

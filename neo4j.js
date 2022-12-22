(async() => {
    const neo4j = require('neo4j-driver');

    const uri = 'neo4j+s://81a4209e.databases.neo4j.io';
    const user = 'neo4j';
    const password = 'TmNfnTWSqGNQdxaoujU6mVKbys9j3OFPcZA3aeLv18o';
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    
    
    
    exports.listAgents = async function () {
        const session = driver.session({ database: 'neo4j' });

        try 
        {
            const readQuery = `MATCH (a:agent)
                            RETURN a.firstName AS firstName, a.lastName AS lastName, a.pseudonym AS pseudonym`;
            const readResult = await session.executeRead(tx =>
                tx.run(readQuery)
            );
            return readResult.records;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }



    exports.listFreeAgents = async function () {
        const session = driver.session({ database: 'neo4j' });

        try {
            const readQuery = `MATCH (a:agent)
                                WHERE NOT EXISTS ((a:agent)-[:Spying]->(:organisation)) AND
                                NOT EXISTS ((a:agent)-[:Protect]->(:organisation))
                                RETURN a.firstName AS firstName, a.lastName AS lastName, a.pseudonym AS pseudonym`;

            const readResult = await session.executeRead(tx =>
                tx.run(readQuery)
            );
            return readResult.records;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }

    exports.addAgent = async function (firstName, lastName, pseudonym) 
    {
        const session = driver.session({ database: 'neo4j' });

        try {
            let info = firstName||lastName ? "ON CREATE SET " : ""
            info += firstName ? 'a.firstName= "' + firstName + '",' : "" 
            info += lastName ? 'a.lastName= "' + lastName + '",' : "" 
            info = info.substring(0, info.length-1)
            const writeQuery = 'merge (a:agent'+'{pseudonym: "'+pseudonym+'"})' + info;
            const writeResult = await session.executeWrite(tx =>
                tx.run(writeQuery)
            );
            return writeResult.records;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }


    exports.assignAgent = async function (pseudonym, organisation, role) 
    {
        const session = driver.session({ database: 'neo4j' });

        try {
            const executiveQuery = 'MATCH (a:agent {pseudonym: "'+pseudonym+'"})'+
            'MATCH (o:organisation {name: "' + organisation +'"})'+
            'MERGE (a)->[rel:'+role+']->(o)'
            
            console.log(executiveQuery);
            const writeResult = await session.executeWrite(tx =>
                tx.run(executiveQuery)
            );
            return writeResult.records;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }

    exports.findConnections = async function (organisation) 
    {
        const session = driver.session({ database: 'neo4j' });

        try {
            const readQuery = 'MATCH (p)-[r]-(a)' +
            'WHERE exists((p)-[]->(:organisation {name: "'+organisation+'"}))' +
            'return DISTINCT p.firstName AS firstName, p.lastName AS lastName, p.pseudonym AS pseudonym '
            const readResult = await session.executeRead(tx =>
                tx.run(readQuery)
            );
            return readResult.records;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }

    exports.listOrganisations = async function () {
        const session = driver.session({ database: 'neo4j' });

        try {
            const readQuery = `MATCH (a:organisation) RETURN a.name AS name`;

            const readResult = await session.executeRead(tx =>
                tx.run(readQuery)
            );
            return readResult.records;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }

    exports.getGraphData = async function () 
    {
        const session = driver.session({ database: 'neo4j' });

        try {
            const result1 = await session.run('MATCH (n) RETURN n, labels(n) AS label');
            const result2 = await session.run('MATCH ()-[r]-() RETURN r');

            // 3. Convert the result into the format required by vis.js
            const nodes = [];
            const edges = [];

            result1.records.forEach((record) => 
            {
            const node = record.get('n').properties;
            const label = record.get('label')
            let name;
            if(label == 'agent')
            {
                name = node.pseudonym
            }
            else if(label == 'organisation')
            {
                name = node.name
            }
            else
            {
                name = "undefined node"
            }
            nodes.push({ id: record.get('n').elementId, label: name });
            });
            
            result2.records.forEach((record) => {
            const relation = record.get('r');
            
            edges.push({ from: relation.startNodeElementId, to: relation.endNodeElementId, label: relation.type });
            });

            function removeDuplicates(array) 
            {
                return array.filter((item, index) => array.indexOf(item).from === index.from && array.indexOf(item).to === index.to);
            }
            const uniqueEdges = removeDuplicates(edges)

            console.log(uniqueEdges)

            const data = {
            nodes: nodes,
            edges: uniqueEdges
            };


            return data;

        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }

})();

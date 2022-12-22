const emptyField = "-"
const vis = require('vis');
const db = require('./neo4j')

module.exports = function(app) 
{
    app.get('/', function(req, res) 
    {
        db.getGraphData().then(ret =>
            {
                res.render('index', {graphData: ret})
            });
        
    });


    app.get('/agents', function(req, res) 
    {
        db.listAgents().then(ret => {          
        res.render('index', {title: "Agents list", data: ret})
    });
    });

    app.get('/freeAgents', function(req, res) 
    {
        db.listFreeAgents().then(ret => {             
            res.render('index', {title: "Free agents list", data: ret})
        })
    });


    app.get('/addAgent', function(req, res) 
    {
        let firstName = req.query.firstName;
        let lastName = req.query.lastName;
        let pseudonym = req.query.pseudonym;
        db.addAgent(firstName, lastName, pseudonym );
        res.render('index')
    })

    app.get('/assignAgent', function(req, res) 
    {
        let pseudonym = req.query.pseudonym;
        let organisation = req.query.organisation;
        let task = req.query.task;
        db.assignAgent(pseudonym, organisation, task);
        res.render('index', {title: 'Agent has been assigned'})
    })

    app.get('/findConnections', function(req, res) 
    {
        let organisation = req.query.organisation;

        db.findConnections(organisation).then(ret => 
        {    
            if(ret.length)
            {
                res.render('index', {data: ret, title: "List of connections with: " + organisation});
            }
            else
            {
                res.render('index', {title: "Connections with: " + organisation + " can not be found"});
            }
            
        })
    });

    app.get('/addAgentForms', function(req, res) 
    {
        res.render('addAgent');
    });

    app.get('/assignAgentForms', function(req, res) 
    {
        db.listFreeAgents().then(agent => 
        {     
            db.listOrganisations().then(organisation =>
            {
                res.render('assignAgent', {agents: agent, organisations: organisation});
            })
        })
    });

    app.get('/findConnectionsForms', function(req, res) 
    {
        db.listOrganisations().then(organisation =>
        {
            res.render('findConnections', {organisations: organisation});
        })
    });
};




    
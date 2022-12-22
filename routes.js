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
            db.getGraphData().then(graph =>
                {
                    res.render('index', {title: "Agents list", data: ret, graphData: graph})
                });   
    });
    });

    app.get('/freeAgents', function(req, res) 
    {
        db.listFreeAgents().then(ret => {      
            db.getGraphData().then(graph =>
                {
                    res.render('index', {title: "Free agents list", data: ret, graphData: graph})
                });       
        })
    });


    app.get('/addAgent', function(req, res) 
    {
        let firstName = req.query.firstName;
        let lastName = req.query.lastName;
        let pseudonym = req.query.pseudonym;
        db.addAgent(firstName, lastName, pseudonym );
        db.getGraphData().then(ret =>
            {
                res.render('index', {title: "Agent has been added", graphData: ret})
            });    
    })

    app.get('/assignAgent', function(req, res) 
    {
        let pseudonym = req.query.pseudonym;
        let organisation = req.query.organisation;
        let task = req.query.task;
        db.assignAgent(pseudonym, organisation, task);
        db.getGraphData().then(graph =>
            {
                res.render('index', {title: 'Agent has been assigned', graphData: graph})
            });    
        
    })

    app.get('/findConnections', function(req, res) 
    {
        let organisation = req.query.organisation;

        db.findConnections(organisation).then(ret => 
        {    
            db.getGraphData().then(graph =>
                {
                    if(ret.length)
                    {
                        res.render('index', {data: ret, title: "List of connections with: " + organisation, graphData: graph});
                    }
                    else
                    {
                        res.render('index', {title: "Connections with: " + organisation + " can not be found", graphData: graph});
                    }
                });  
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




    
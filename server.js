const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const knex = require('knex');

const database = [{
	familyname: 'Turp',
	itemlist: [{name:'Strawberries', quan:5}, {name:'Bread', quan:10}]
},
{
	familyname: 'Akkies',
	itemlist: [{name:'Bananas', quan:5}, {name:'Cherries', quan:10}]
}]

const app = express();

// app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());


app.get('/', (req,res)=>{
	res.send(database);
	console.log(database);
	// db.select('*').from('users')
	// 	.then(users => {
	// 		res.send(users)
	// 	});

})

app.put('/decreaseQuantity', (req,res) => {
	const { family_name, item } = req.body;
})

app.put('/increaseQuantity', (req,res) => {
	const { family_name, item } = req.body;
})

app.put('/removeItem', (req,res) => {
	const { family_name, item } = req.body;
})

app.put('/addItem', (req,res) => {
	const { family_name, item } = req.body;

	const its = arr.find(o=>o.familyname.toLowerCase()===family_name.toLowerCase()).itemlist;
	// const 


})

app.get('/items', (req,res) => {
	const { family_name } = req.body;
    let arr = database;

	if(arr.some(el => el.familyname.toLowerCase() === family_name.toLowerCase())){
		const its = arr.find(o=>o.familyname.toLowerCase()===family_name.toLowerCase()).itemlist;
		return res.send(its);
	}
	else{
		res.status(400).json('family not found!')
	}
})


app.post('/register', (req,res) => {
	const { email, family_name, password } = req.body;

	if(!email || !family_name || !password){
		return res.status(400).json('incorrect form submission')
	}
	else{
		new_obj = {familyname:family_name, itemlist:[]}
		database.push(new_obj);
		return res.send(database);
	}
});


app.post('/signin', (req,res) => {
	const { family_name, password } = req.body;

	if(!family_name || !password){
		return res.status(400).json('unable to log in!')
	}
	else{

    	let arr = database;
		if(arr.some(el => el.familyname.toLowerCase() === family_name.toLowerCase())){
			return res.send('Success!')
		}
		else{
			return res.status(400).json('unable to log in!')
		}
	}
});


app.listen(process.env.PORT || 3003, () =>{
	console.log(`app is running on port ${process.env.PORT}`);
})

// sign in - POST
// register - POST
// get list of items - GET
// update list of items - PUT
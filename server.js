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

const db = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    database: 'shopping_list_db'
  }
})

const saltRounds = 10;

const app = express();

// app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());


app.get('/', (req,res)=>{
	db.select('*').from('users')
		.then(users => {
			res.send(users)
		});
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

app.put('/addShoppingList', (req,res) => {
	const { family_name, shopping_list_name } = req.body;

	db('shopping_lists').insert

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
		const hash = bcrypt.hashSync(password, saltRounds);
		let family_id = ''

		for (var i = 0; i < 3; i++) {
			family_id = family_id.toString() + Math.floor((Math.random() * 10) + 1).toString() + family_name.charCodeAt(i).toString()
		}

		family_id = Number(family_id)

		db.transaction(trx => {
			trx.insert({
				password: hash,
				family_id: family_id,
			})
			.into('login')
			.returning('family_id')
			.then(familyID => {
				return trx('users')
					.returning('*')
					.insert({
						email: email,
						family_name: family_name,
						family_id: familyID[0]
					})
					.then(user => {
						res.json(user[0]);
					})
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => res.status(400).json('unable to register'))

	}
});


app.post('/signin', (req,res) => {
	const { family_name, password } = req.body;

	if(!family_name || !password){
		return res.status(400).json('unable to log in!')
	}
	else{

		db('users').join('login', {'users.family_id': 'login.family_id'})
		.select('family_name','email', 'password')
		.where('family_name', '=', family_name)
		.then(data => {

			let isValid = false;
			let valid_email = '';

			for(data_point of data){
				isValid = bcrypt.compareSync(password, data_point.password);
				if (isValid){
					valid_email = data_point.email;
					break;
				}
			}

			if(isValid){
				return db.select('*').from('users')
					.where('email', '=', valid_email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to get user'))
			}
			else{
				res.status(400).json('incorrect credentials')
			}
		})
		.catch(err => res.status(400).json('wrong credentials'))
	}

});


app.listen(process.env.PORT || 3003, () =>{
	console.log(`app is running on port ${process.env.PORT}`);
})

// sign in - POST
// register - POST
// get list of items - GET
// update list of items - PUT
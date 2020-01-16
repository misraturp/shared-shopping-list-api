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
    connectionString: process.env.DATABASE_URL,
  	ssl: true
  }
})

const saltRounds = 10;

const app = express();

// app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());


app.get('/', (req,res)=>{
	console.log('working!')
	res.send('working!')
	// db.select('*').from('users')
	// 	.then(users => {
	// 		res.send(users)
	// 	});
})


// app.get('/', (req,res)=>{
// 	db.select('*').from('users')
// 		.then(users => {
// 			res.send(users)
// 		});
// })

app.put('/decreaseQuantity', (req,res) => {
	const { shopping_list_id, item } = req.body;

	db('items')
		.where({
		  shopping_list_id: shopping_list_id,
		  item:  item
		})
		.decrement('quantity', 1)
		.then(d => {
			db('items').where({quantity:0}).del().then(l=>console.log(l))
			.then(l => {
				db.select('id','item','quantity','done').from('items')
				.where('shopping_list_id' , '=' , shopping_list_id)
				.then(list => res.json(list))
			})
		})

		.catch(err => res.status(400).json('error increase item amount'))
})

app.put('/increaseQuantity', (req,res) => {
	const { shopping_list_id, item } = req.body;

	db('items')
		.where({
		  shopping_list_id: shopping_list_id,
		  item:  item
		})
		.increment('quantity', 1)
		.then(l => {
			db.select('id','item','quantity','done').from('items')
			.where('shopping_list_id' , '=' , shopping_list_id)
			.then(list => res.json(list))
		})
		.catch(err => res.status(400).json('error increase item amount'))

})

app.delete('/removeItem', (req,res) => {
	const { shopping_list_id, item } = req.body;

	db('items')
		.where({
			  shopping_list_id: shopping_list_id,
			  item:  item
			})
		.del()
		.then(l => {
			db.select('id','item','quantity','done').from('items')
			.where('shopping_list_id' , '=' , shopping_list_id)
			.then(list => res.json(list))
		})
		.catch(err => res.status(400).json('error removing item frm this shopping list'))
})

app.put('/doneItem', (req,res) => {
	const { shopping_list_id, item } = req.body;

	db('items').select('done')
		.where({
			  shopping_list_id: shopping_list_id,
			  item: item
			})
		.then(done_value=>{
			done_value = done_value[0].done;
			console.log(done_value);
			if(done_value){
				return 'false'
			}else{
				return 'true'
			}
		})
		.then(value=>
			db.from('items')
				.where({
				  shopping_list_id: shopping_list_id,
				  item: item
				})
				.update({done:value})
			.then(l => {
				db.select('id','item','quantity','done').from('items')
				.where('shopping_list_id' , '=' , shopping_list_id)
				.then(list => res.json(list))
			})
			.catch(err => res.status(400).json('error marking this item as done')))

	
})

app.post('/items', (req,res) => {
	const { shopping_list_id } = req.body;

	// console.log(shopping_list_id)
	db.select('id','item','quantity','done').from('items')
		.where('shopping_list_id' , '=' , shopping_list_id)
		.then(list => res.json(list))
		.catch(err => res.status(400).json('error getting items for this shopping list'))

})

app.post('/addItem', (req,res) => {
	const { shopping_list_id, item } = req.body;

	db('items').insert({
		shopping_list_id:shopping_list_id,
		item:item,
		quantity:1
	})
	.then(l => {
		db.select('id','item','quantity','done').from('items')
			.where('shopping_list_id' , '=' , shopping_list_id)
			.then(list => res.json(list))

	})
	.catch(err => res.status(400).json('unable to add item to list'))

})

app.post('/addShoppingList', (req,res) => {
	const { family_id, shopping_list_name } = req.body;

	db('lists_of_users').insert({
		shopping_list_name: shopping_list_name,
		family_id:family_id
	})
	.then(result=>{
		db.select('shopping_list_name','shopping_list_id').from('lists_of_users')
		.where('family_id' , '=' , family_id)
		.then(list => res.json(list))
	})
	.catch(err => res.status(400).json('error adding shopping list'))

})

app.post('/shopping_lists', (req,res) => {
	const { family_id } = req.body;

	// db('users').join('lists_of_users',{'users.family_id':'lists_of_users.family_id'})
	// 	.select('shopping_list_name')
	// 	.where('family_name', '=', family_name)
	// 	.then(console.log)
	// 	.then(list => res.json(list))
	// 	.catch(err => res.status(400).json('error getting shopping lists'))

	db.select('shopping_list_name','shopping_list_id').from('lists_of_users')
		.where('family_id' , '=' , family_id)
		.then(list => res.json(list))
		.catch(err => res.status(400).json('error getting shopping lists'))

})

app.post('/register', (req,res) => {
	const { email, family_name, password } = req.body;
	// console.log(email, family_name, password)

	if(!email || !family_name || !password){
		return res.status(400).json('incorrect form submission')
	}
	else{
		const hash = bcrypt.hashSync(password, saltRounds);
		let family_id = ''

		// TODO: family names that have less than 3 characters!
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
			})
			.then(user => {
				return trx('lists_of_users')
					.returning('*')
					.insert({
						family_id:user[0].family_id,
						shopping_list_name: 'groceries'
					})

			})
			.then(shopping_list => {
				db.select('*')
					.from('users')
					.where('family_id', '=', shopping_list[0].family_id)
					.then(user=>res.json(user[0]))
				
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => res.status(400).json('unable to register'))

	}
});

app.post('/signin', (req,res) => {
	const { family_name, password } = req.body;
	// console.log(family_name)

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
					.then(user => { res.json(user[0])
						// db('users')
						// 	.join('lists_of_users', {'users.family_id': 'lists_of_users.family_id'})
						// 	.join('items', {'lists_of_users.shopping_list_id': 'items.shopping_list_id'})
						// 	.select('*')
						// 	.where('users.family_name', '=', family_name)
						// 	.then(data => res.json(data))
						
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


app.listen(process.env.PORT || 3030, () =>{
	console.log(`app is running on port ${process.env.PORT}`);
})

// sign in - POST
// register - POST
// get list of items - GET
// update list of items - PUT
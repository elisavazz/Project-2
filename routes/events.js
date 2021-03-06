const express = require('express');
const router = express.Router();
const Events = require('../models/Events');
const { attend } = require('../utils/attend');
// const fs = require("fs");

const User = require('../models/User');

router.get('/create', (req, res, next) => {
	res.render('create/post-event', { user: req.user });
});

router.get('/:id/delete', (req, res, next) => {
	Events.findByIdAndRemove({ _id: req.params.id }, (err, event) => {
		if (err) console.log(err);
		res.redirect('/dashboard');
	});
});

router.post('/create', (req, res, next) => {
	if (!req.files) return res.status(400).send('No files were uploaded.');
	const file = req.files.picture;
	console.log(file);

	//if (err) return res.status(500).send(err);

	const { title, type, description, date, picture, city, venue } = req.body;

	new Events({
		title,
		type,
		description,
		date,
		picture,
		city,
		venue
	})
		.save()
		.then((event) => {
			file.mv(`public/images/${event._id}.jpg`, function(err) {
				console.log('event created,pic uploaded, pic name: ' + req.params.id);
				res.redirect('/dashboard');
			});

			//res.redirect('/:id'); //link to the event/id/profile
		})
		.catch((error) => {
			console.log(error);
		});
});

// /* GET home page */
// router.get('/:id', (req, res, next) => {
// 	Events.findById(req.params.id)
// 		.then((event) => res.render('event-page', { event: req.params }))
// 		.catch((err) => console.log(err));
// });
// /* GET home page */
router.get('/:id', (req, res, next) => {
	if (req.user === undefined) {
		res.redirect('auth/signup');
	} else if (req.user.email === undefined && req.user.collection.collectionName === 'users') {
		res.render('create/create-user', { user: req.user });
	} else if (req.user.email === undefined && req.user.collection.collectionName === 'companies') {
		res.render('create/create-company', { user: req.user });
	} else {
		let user = req.user;

		Events.findById(req.params.id).then((event) => {
			User.find().then((users) => {
				res.render('event-page', { event, user });
			});
		});
	}
});

router.post('/:id/attend', (req, res) => {
	console.log('I FOUNT STUFF ' + req.params.id);
	attend(req.params.id, req.user);
});

router.get('/:id/edit', (req, res) => {
	Events.findById(req.params.id).then((event) => {
		res.render('create/edit-event', { event });
	});
});

router.post('/:id/edit', (req, res) => {
	if (!req.files) {
		const { title, type, description, date, city, venue } = req.body;

		Events.findByIdAndUpdate(req.params.id, {
			title,
			type,
			description,
			date,
			city,
			venue
		})
			.then(() => {
				let event = req.params.id;
				console.log('updated event ' + event);
				// res.send('UPDATE DONE');
				res.redirect('/dashboard');
			})
			.catch((error) => {
				console.log(error);
			});
	} else {
		const file = req.files.picture;
		file.mv(`public/images/${req.params.id}.jpg`, function(err) {
			const { title, type, description, date, picture, city, venue } = req.body;

			Events.findByIdAndUpdate(req.params.id, {
				title,
				type,
				description,
				date,
				picture,
				city,
				venue
			})
				.then(() => {
					let event = req.params.id;
					console.log('updated event ' + event);

					res.redirect('/dashboard');
				})
				.catch((error) => {
					console.log(error);
				});
		});
	}
});

module.exports = router;

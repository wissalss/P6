const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);

    const sauce = new Sauce({
        userId: sauceObject.userId,
        name: sauceObject.name,
        manufacturer: sauceObject.manufacturer,
        description: sauceObject.description,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        mainPepper: sauceObject.mainPepper,
        heat: sauceObject.heat,
    });
    sauce.save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
        .catch(error => res.status(400).json({ error }));
}

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => { res.status(200).json(sauces); })
        .catch((error) => { res.status(400).json({ error: error }); }
        );
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => { res.status(200).json(sauce); })
        .catch((error) => { res.status(404).json({ error: error }); });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    switch (req.body.like) {
        case -1:
            //Si le user a cliqué sur dislike
            Sauce.updateOne({ _id: req.params.id }, {
                _id: req.params.id,
                $inc: { dislikes: + req.body.like * -1 },
                $push: { usersDisliked: req.body.userId },
            })
                .then(() => res.status(201).json({ message: "Dislike enregistré !" }))
                .catch(error => res.status(400).json({ error }));
            break;
        case 1:
            //Si le user a cliqué sur like
            Sauce.updateOne({ _id: req.params.id }, {
                _id: req.params.id,
                $inc: { likes: + req.body.like },
                $push: { usersLiked: req.body.userId },
            })
                .then(() => res.status(201).json({ message: "Like enregistré !" }))
                .catch(error => res.status(400).json({ error }));
            break;

        case 0:
            //Si le user reclique sur like ou dislike, annulation du like ou du dislike précédent
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    //Si l'id du user est présent dans le tableau des usersLiked, c'est qu'il a liké précédemment
                    if (sauce.usersLiked.indexOf(req.body.userId) !== -1) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            _id: req.params.id,
                            $inc: { likes: -1 },
                            $pull: { usersLiked: req.body.userId },
                        })
                            .then(() => res.status(201).json({ message: "Annulation du like enregistrée !" }))
                            .catch(error => res.status(400).json({ error }));
                    }
                    //Si l'id du user est présent dans le tableau des usersDisliked, c'est qu'il a disliké précédemment
                    if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            _id: req.params.id,
                            $inc: { dislikes: -1 },
                            $pull: { usersDisliked: req.body.userId }
                        })
                            .then(() => res.status(201).json({ message: "Annulation du dislike enregistrée !" }))
                            .catch(error => res.status(400).json({ error }));
                    }
                })
                .catch(error => res.status(500).json({ error }));
            break;
        default:
            throw error;
    }
};
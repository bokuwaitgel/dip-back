const express = require('express');
const router = express.Router();
const {
  auth,
  authAdmin,
  setRequestUser,
} = require('../middleware/auth');
const { retakingUser } = require('../utils/validation');

const Survey = require('../models/survey');
const Question = require('../models/question');
const Entry = require('../models/entry');
const User = require('../models/user');
const Result = require('../models/result');
const Options = require('../models/options');

const SurveyView = require('../views/survey');
const EntryView = require('../views/entry');
const QuestionView = require('../views/question');
const ResultView = require('../views/result');
const ResultViewUser = require('../views/resultUser');
const OptionView = require('../views/option');

router.get('/', setRequestUser, async (req, res) => {
  const populate = ['createdBy'];
  try {
    const user = req.user ? await User.findById(req.user.id) : {};
    let surveys = await Survey.find({}).populate(populate);
    surveys = surveys.filter((i) => {
      return (
        user.role === 'COORDINATOR' ||
        i.status === 'ACTIVE' ||
        i.status === 'CLOSED'
      );
    });
    res.status(200).json(surveys.map((i) => SurveyView(i, populate)));
  } catch (err) {
    // console.log(err)
    res.status(500).send(err.message);
  }
});

router.get('/:id', setRequestUser, async (req, res) => {
  const populate = ['questions', 'options'];
  try {
    const taken =
      Boolean(req.user) &&
      (await retakingUser(req.user.id, req.params.id));
    const survey = await Survey.findById(req.params.id).populate(
      populate
    );

    res.status(200).json({
      ...SurveyView(survey, populate),
      taken,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/:id/entries', async (req, res) => {
  try {
    const entries = await Entry.find({ survey: req.params.id });

    res.status(200).json(entries.map((i) => EntryView(i)));
  } catch (err) {
    // console.log(err)
    res.status(500).send(err);
  }
});
// router.get('/:id/person', async (req, res) => {
// 	try {
// 		const entries = await Entry.find({ user: req.params.id })

// 		res.status(200).json(
// 			entries.map(i => EntryView(i))
// 		)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send(err)
// 	}
// })
router.get('/:id/:sur/person', async (req, res) => {
  const populate = ['questions', 'createdBy', 'options'];
  try {
    const survey = await Survey.findById(req.params.sur).populate(
      populate
    );
    const entries = await Entry.find({
      user: req.params.id,
      survey: req.params.sur,
    });
    // console.log(entries)
    let result = 0;

    await entries.forEach((i) => {
      i.answers.forEach((j) => {
        result += parseInt(j.score);
      });
    });
    let qRes = survey.questions.map((i) => QuestionView(i));
    await qRes.forEach(async (item) => {
      item.result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      await entries.forEach((i) => {
        const questionAns = i.answers.find((x) => {
          const id1 = x.question.toString();
          const id2 = item.id.toString();
          return id1 == id2;
        }).answer || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const index = item.options.indexOf(questionAns);
        item.result[index] = item.result[index]
          ? item.result[index] + 1
          : 1;
      });
    });
    res
      .status(200)
      .json(ResultViewUser(survey, populate, result, qRes));
  } catch (err) {
    // console.log(err)
    res.status(500).send(err);
  }
});
router.get('/:id/result', async (req, res) => {
  const populate = ['questions', 'createdBy'];
  try {
    const survey = await Survey.findById(req.params.id).populate(
      populate
    );
    const entries = await Entry.find({ survey: req.params.id });

    let result = survey.questions.map((i) => QuestionView(i));
    await result.forEach(async (item) => {
      item.result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      await entries.forEach((i) => {
        const questionAns = i.answers.find((x) => {
          const id1 = x.question.toString();
          const id2 = item.id.toString();
          return id1 == id2;
        }).answer;
        const index = item.options.indexOf(questionAns);
        item.result[index] = item.result[index]
          ? item.result[index] + 1
          : 1;
      });
    });
    res.status(200).json(ResultView(survey, populate, result));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post('/', authAdmin, async (req, res) => {
  const { title, questions, description, options, status, type } =
    req.body;
  // console.log(options)
  try {
    if (!title)
      return res.status(400).json({
        message: 'Please enter a title for your survey',
      });
    if (!questions || questions.length === 0)
      return res.status(400).json({
        message: 'A survey must have 1 ',
      });
    if (
      questions.find(
        (item) =>
          !item.options ||
          item.options.length === 0 ||
          item.options.length > 10
      )
    )
      return res.status(400).json({
        message: 'Every survey question must have 1 to 10 options',
      });
    let questionsRef = await Question.insertMany(questions);
    let optionRef = await Options.insertMany(options);
    let survey = new Survey({
      title,
      type,
      description,
      questions: questionsRef.map((i) => i.id),
      options: optionRef.map((i) => i.id),
      createdBy: req.user.id,
      status,
    });

    await survey.save();

    res.status(200).json(SurveyView(survey));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/update/:id', authAdmin, async (req, res) => {
  const populate = ['questions', 'createdBy', 'options'];
  let survey = await Survey.findById(req.params.id).populate(
    populate
  );
  const { title, questions, description, status, options, type } =
    req.body;
  try {
    await questions.forEach(async (item) => {
      if (item?.id) {
        Question.findByIdAndDelete(item.id).then((data) => {
          console.log(data);
        });
      }
    });
    if (!title)
      return res.status(400).json({
        message: 'Please enter a title for your survey',
      });
    if (!questions || questions.length === 0)
      return res.status(400).json({
        message: 'A survey must have 1 ',
      });
    if (
      questions.find(
        (item) =>
          !item.options ||
          item.options.length === 0 ||
          item.options.length > 10
      )
    )
      return res.status(400).json({
        message: 'Every survey question must have 1 to 10 options',
      });
    let questionsRef = await Question.insertMany(questions);
    let optionRef = await Options.insertMany(options);
    survey.title = title;
    survey.type = type;
    survey.description = description;
    survey.questions = questionsRef.map((i) => i.id);
    survey.options = optionRef.map((i) => i.id);
    survey.createdBy = req.user.id;
    survey.status = status;
    // let survey = new Survey({
    // 	title,
    // 	type,
    // 	description,
    // 	questions: questionsRef.map(i => i.id),
    // 	createdBy: req.user.id,
    // 	status
    // })

    // await survey.save()

    // res.status(200).json(
    // 	SurveyView(survey)
    // )
    await survey.save();

    res.status(200).json(SurveyView(survey, populate));
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/delete/:id', authAdmin, async (req, res) => {
  const populate = ['questions', 'createdBy'];
  try {
    const id = req.params.id;
    const survey = await Survey.findById(id).populate(populate);
    let result = survey.questions.map((i) => QuestionView(i));
    await result.forEach(async (item) => {
      Question.findByIdAndDelete(item.id).then((data) => {
        if (!data) {
          console.log('failed');
        } else {
          console.log('succ');
        }
      });
    });
    Survey.findByIdAndDelete(id)
      .then((data) => {
        if (!data) {
          res
            .status(404)
            .send({
              message: `Cannot Delete with id ${id}. Maybe id is wrong`,
            });
        } else {
          res.send({
            message: 'Survey was deleted successfully!',
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: 'Could not delete Survey with id=' + id,
        });
      });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put('/status/:id', authAdmin, async (req, res) => {
  const populate = ['questions', 'createdBy'];
  try {
    const status = req.body.status.toUpperCase();

    let survey = await Survey.findById(req.params.id).populate(
      populate
    );

    if (
      status !== 'IDLE' &&
      status !== 'ACTIVE' &&
      status !== 'CLOSED'
    )
      return res.status(400).json({
        message: 'Invalid survey status',
      });
    survey.status = status;
    await survey.save();

    res.status(200).json(SurveyView(survey, populate));
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;

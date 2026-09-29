const { MedicalRecord, Medicine, Appointment, Pantry, ShoppingList, FamilyMember, Reward } = require('../models');
const { calculateBMI } = require('../utils/helpers');

// ===== MEDICAL RECORDS =====
const getMedicalRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord.findAll({ where: { user_id: req.user.id }, order: [['created_at', 'DESC']] });
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};
const addMedicalRecord = async (req, res, next) => {
  try {
    const { title, record_date, notes, record_type } = req.body;
    const file_url = req.file ? `/uploads/medical/${req.file.filename}` : null;
    const record = await MedicalRecord.create({ user_id: req.user.id, title, file_url, record_date, notes, record_type });
    res.status(201).json({ success: true, data: record, message: 'Medical record added!' });
  } catch (err) { next(err); }
};
const deleteMedicalRecord = async (req, res, next) => {
  try {
    await MedicalRecord.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) { next(err); }
};

// ===== MEDICINES =====
const getMedicines = async (req, res, next) => {
  try {
    const meds = await Medicine.findAll({ where: { user_id: req.user.id, is_active: true } });
    res.json({ success: true, data: meds });
  } catch (err) { next(err); }
};
const addMedicine = async (req, res, next) => {
  try {
    const med = await Medicine.create({ user_id: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: med, message: 'Medicine added!' });
  } catch (err) { next(err); }
};
const updateMedicine = async (req, res, next) => {
  try {
    const med = await Medicine.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });
    await med.update(req.body);
    res.json({ success: true, data: med });
  } catch (err) { next(err); }
};
const deleteMedicine = async (req, res, next) => {
  try {
    await Medicine.update({ is_active: false }, { where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true, message: 'Medicine removed' });
  } catch (err) { next(err); }
};

// ===== APPOINTMENTS =====
const getAppointments = async (req, res, next) => {
  try {
    const apts = await Appointment.findAll({ where: { user_id: req.user.id }, order: [['date', 'DESC']] });
    res.json({ success: true, data: apts });
  } catch (err) { next(err); }
};
const addAppointment = async (req, res, next) => {
  try {
    const apt = await Appointment.create({ user_id: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: apt, message: 'Appointment logged!' });
  } catch (err) { next(err); }
};
const deleteAppointment = async (req, res, next) => {
  try {
    await Appointment.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true, message: 'Appointment removed' });
  } catch (err) { next(err); }
};

// ===== PANTRY =====
const getPantry = async (req, res, next) => {
  try {
    const items = await Pantry.findAll({ where: { user_id: req.user.id }, order: [['expiry_date', 'ASC']] });
    const today = new Date();
    const alerts = items.filter(item => {
      if (!item.expiry_date) return false;
      const days = (new Date(item.expiry_date) - today) / (1000 * 60 * 60 * 24);
      return days <= 3;
    });
    res.json({ success: true, data: items, expiry_alerts: alerts });
  } catch (err) { next(err); }
};
const addPantryItem = async (req, res, next) => {
  try {
    const item = await Pantry.create({ user_id: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: item, message: 'Item added to pantry!' });
  } catch (err) { next(err); }
};
const deletePantryItem = async (req, res, next) => {
  try {
    await Pantry.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true, message: 'Item removed from pantry' });
  } catch (err) { next(err); }
};

// ===== SHOPPING LIST =====
const getShoppingList = async (req, res, next) => {
  try {
    const items = await ShoppingList.findAll({ where: { user_id: req.user.id }, order: [['category', 'ASC']] });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};
const addShoppingItem = async (req, res, next) => {
  try {
    const item = await ShoppingList.create({ user_id: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: item, message: 'Added to shopping list!' });
  } catch (err) { next(err); }
};
const toggleShoppingItem = async (req, res, next) => {
  try {
    const item = await ShoppingList.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    await item.update({ purchased: !item.purchased });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};
const deleteShoppingItem = async (req, res, next) => {
  try {
    await ShoppingList.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true, message: 'Item removed' });
  } catch (err) { next(err); }
};

// ===== FAMILY MEMBERS =====
const getFamilyMembers = async (req, res, next) => {
  try {
    const members = await FamilyMember.findAll({ where: { user_id: req.user.id } });
    const membersWithBMI = members.map(m => {
      if (m.height && m.weight) {
        const { bmi, category } = calculateBMI(m.weight, m.height);
        return { ...m.toJSON(), bmi, bmi_category: category };
      }
      return m.toJSON();
    });
    res.json({ success: true, data: membersWithBMI });
  } catch (err) { next(err); }
};
const addFamilyMember = async (req, res, next) => {
  try {
    const member = await FamilyMember.create({ user_id: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: member, message: 'Family member added!' });
  } catch (err) { next(err); }
};
const deleteFamilyMember = async (req, res, next) => {
  try {
    await FamilyMember.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};

// ===== REWARDS =====
const getRewards = async (req, res, next) => {
  try {
    const reward = await Reward.findOne({ where: { user_id: req.user.id } });
    const level = Math.floor((reward?.xp || 0) / 100) + 1;
    const nextLevelXP = level * 100;
    const currentLevelXP = (level - 1) * 100;
    const progress = ((reward?.xp || 0) - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;
    res.json({ success: true, data: { ...reward?.toJSON(), level, next_level_xp: nextLevelXP, level_progress: Math.round(progress) } });
  } catch (err) { next(err); }
};

module.exports = {
  getMedicalRecords, addMedicalRecord, deleteMedicalRecord,
  getMedicines, addMedicine, updateMedicine, deleteMedicine,
  getAppointments, addAppointment, deleteAppointment,
  getPantry, addPantryItem, deletePantryItem,
  getShoppingList, addShoppingItem, toggleShoppingItem, deleteShoppingItem,
  getFamilyMembers, addFamilyMember, deleteFamilyMember,
  getRewards,
};

const supabase = require('../supabaseClient');

// CREATE SCHOOL
exports.createSchool = async (req, res) => {
  const {
    userId,
    name,
    color,
    location,
    motto,
    aim,
    email,
    phone,
    type,
    accreditation,
    establishedYear,
    gender,
  } = req.body;

  try {
    // 1. Insert the school
    const { data: newSchool, error: insertError } = await supabase
      .from('schools')
      .insert([
        {
          name,
          color,
          location,
          motto,
          aim,
          email,
          phone,
          type,
          accreditation,
          establishedYear,
          gender,
          createdBy: userId,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Update the user to link schoolId + role = admin + isVerified
    await supabase
      .from('users')
      .update({
        schoolId: newSchool.id,
        role: 'admin',
        isVerified: true,
      })
      .eq('id', userId);

    res.status(201).json({
      message: 'School created',
      schoolId: newSchool.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET SCHOOL INFO
exports.schoolInfo = async (req, res) => {
  const { schoolId } = req.body;

  try {
    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (!school) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    res.json({
      schoolId: school.id,
      school: school,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

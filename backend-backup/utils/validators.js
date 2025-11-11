const Joi = require('joi');

// Validation Schema cho Event
exports.eventSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.empty': 'Tên sự kiện không được để trống',
      'string.min': 'Tên sự kiện phải có ít nhất 5 ký tự',
      'string.max': 'Tên sự kiện không được quá 200 ký tự',
      'any.required': 'Tên sự kiện là bắt buộc'
    }),

  description: Joi.string()
    .min(20)
    .max(5000)
    .required()
    .trim()
    .messages({
      'string.empty': 'Mô tả không được để trống',
      'string.min': 'Mô tả phải có ít nhất 20 ký tự',
      'string.max': 'Mô tả không được quá 5000 ký tự',
      'any.required': 'Mô tả là bắt buộc'
    }),

  category: Joi.string()
    .valid('tree_planting', 'cleanup', 'charity', 'education', 'other')
    .required()
    .messages({
      'any.only': 'Danh mục không hợp lệ',
      'any.required': 'Danh mục là bắt buộc'
    }),

  location: Joi.object({
    address: Joi.string()
      .min(5)
      .max(500)
      .required()
      .trim()
      .messages({
        'string.empty': 'Địa điểm không được để trống',
        'string.min': 'Địa điểm phải có ít nhất 5 ký tự',
        'any.required': 'Địa điểm là bắt buộc'
      }),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90),
      lng: Joi.number().min(-180).max(180)
    }).optional()
  }).required(),

  startDate: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.base': 'Ngày bắt đầu không hợp lệ',
      'date.min': 'Ngày bắt đầu phải là ngày trong tương lai',
      'any.required': 'Ngày bắt đầu là bắt buộc'
    }),

  endDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'Ngày kết thúc không hợp lệ',
      'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu',
      'any.required': 'Ngày kết thúc là bắt buộc'
    }),

  maxParticipants: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
    .messages({
      'number.base': 'Số lượng tối đa phải là số',
      'number.min': 'Số lượng tối đa phải lớn hơn 0',
      'number.max': 'Số lượng tối đa không được quá 10,000',
      'any.required': 'Số lượng tối đa là bắt buộc'
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .optional()
    .messages({
      'array.max': 'Không được upload quá 10 ảnh'
    }),

  requirements: Joi.string()
    .max(2000)
    .allow('')
    .optional()
    .trim(),

  benefits: Joi.string()
    .max(2000)
    .allow('')
    .optional()
    .trim(),

  contactInfo: Joi.object({
    name: Joi.string().max(100).trim(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 số)'
    }),
    email: Joi.string().email().messages({
      'string.email': 'Email không hợp lệ'
    })
  }).optional()
});

// Validation Schema cho Update Event (các field optional)
exports.updateEventSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .trim()
    .optional(),

  description: Joi.string()
    .min(20)
    .max(5000)
    .trim()
    .optional(),

  category: Joi.string()
    .valid('tree_planting', 'cleanup', 'charity', 'education', 'other')
    .optional(),

  location: Joi.object({
    address: Joi.string().min(5).max(500).trim().optional(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90),
      lng: Joi.number().min(-180).max(180)
    }).optional()
  }).optional(),

  startDate: Joi.date().iso().optional(),

  endDate: Joi.date().iso().optional(),

  maxParticipants: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .optional(),

  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .optional(),

  requirements: Joi.string()
    .max(2000)
    .allow('')
    .optional(),

  benefits: Joi.string()
    .max(2000)
    .allow('')
    .optional(),

  contactInfo: Joi.object({
    name: Joi.string().max(100).trim(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/),
    email: Joi.string().email()
  }).optional()
}).min(1); // Ít nhất 1 field để update

// Validation cho Registration approval
exports.approveRegistrationSchema = Joi.object({
  status: Joi.string()
    .valid('confirmed', 'rejected')
    .required()
    .messages({
      'any.only': 'Trạng thái phải là confirmed hoặc rejected',
      'any.required': 'Trạng thái là bắt buộc'
    }),

  reason: Joi.string()
    .max(500)
    .when('status', {
      is: 'rejected',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Vui lòng nhập lý do từ chối'
    }),

  notes: Joi.string()
    .max(1000)
    .allow('')
    .optional()
});

// Validation cho Complete Registration
exports.completeRegistrationSchema = Joi.object({
  attendance: Joi.object({
    checkIn: Joi.date().iso().optional(),
    checkOut: Joi.date().iso().optional(),
    hours: Joi.number().min(0).max(24).optional()
  }).optional(),

  notes: Joi.string()
    .max(1000)
    .allow('')
    .optional()
});

// Validation cho Post
exports.postSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .trim()
    .messages({
      'string.empty': 'Nội dung bài viết không được để trống',
      'string.max': 'Nội dung không được quá 5000 ký tự',
      'any.required': 'Nội dung là bắt buộc'
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .optional()
    .messages({
      'array.max': 'Không được upload quá 10 ảnh'
    })
});

// Validation cho Comment
exports.commentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .trim()
    .messages({
      'string.empty': 'Nội dung bình luận không được để trống',
      'string.max': 'Bình luận không được quá 1000 ký tự',
      'any.required': 'Nội dung là bắt buộc'
    })
});

// Validation cho Event Report Filters
exports.reportFiltersSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed', 'no_show')
    .optional(),
  format: Joi.string()
    .valid('json', 'csv', 'excel')
    .default('json')
    .optional()
});

// Validation cho Admin User Update
exports.adminUpdateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional(),
  role: Joi.string().valid('volunteer', 'manager', 'admin').optional(),
  isActive: Joi.boolean().optional()
}).min(1);

// Validation cho Change Role
exports.changeRoleSchema = Joi.object({
  role: Joi.string()
    .valid('volunteer', 'manager', 'admin')
    .required()
    .messages({
      'any.only': 'Role phải là volunteer, manager hoặc admin',
      'any.required': 'Role là bắt buộc'
    })
});

// Validation cho Approve Event
exports.approveEventSchema = Joi.object({
  status: Joi.string()
    .valid('approved', 'rejected')
    .required()
    .messages({
      'any.only': 'Status phải là approved hoặc rejected',
      'any.required': 'Status là bắt buộc'
    }),

  reason: Joi.string()
    .max(500)
    .when('status', {
      is: 'rejected',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Vui lòng nhập lý do từ chối'
    })
});
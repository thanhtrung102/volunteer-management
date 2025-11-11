// Middleware để validate request body với Joi schema
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Trả về tất cả errors
      stripUnknown: true // Loại bỏ fields không có trong schema
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    // Gán validated data vào req.body
    req.body = value;
    next();
  };
};

// Middleware để validate query params
exports.validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query parameters không hợp lệ',
        errors
      });
    }

    req.query = value;
    next();
  };
};
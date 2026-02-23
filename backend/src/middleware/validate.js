export function validate(schema, options = {}) {
  return (req, res, next) => {
    const source = options.params ? req.params : options.bodyOnly ? req.body : { ...req.body, ...req.params };
    const result = schema.safeParse(source);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }
    if (options.params) req.validParams = result.data;
    else req.valid = result.data;
    next();
  };
}

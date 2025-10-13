export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

export function requireSelfOrAdmin(req, res, next) {
  const { id } = req.params;
  const isSelf = req.user?.id === id;
  const isAdmin = req.user?.role === "admin";
  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

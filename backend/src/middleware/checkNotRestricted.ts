const checkNotRestricted = (req, res, next) => {
    const { restriction } = req.user;

    if (restriction && restriction.status === true) {
        const currentDate = new Date();
        if (currentDate < new Date(restriction.restrictedUntil)) {
            return res.status(403).json({ message: "You are restricted from performing this action." });
        }
    }

    next();
};

export default checkNotRestricted;
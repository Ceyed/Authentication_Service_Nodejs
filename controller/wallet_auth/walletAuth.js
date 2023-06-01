const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const sigUtil = require("@metamask/eth-sig-util");
const uuidv4 = require("uuid").v4;

const generateNonce = () => uuidv4();


async function walletLogin(request, response) {
    try {
        const { walletId } = request.body;

        if (!walletId) {
            return response.status(400).json('All inputs are required')
        }

        let user = await prisma.user.findFirst({
            where: {
                wallet_id: walletId,
            }
        });
        const nonce = generateNonce()
        if (!user) {
            user = await prisma.user.create({
                data: {
                    wallet_id: walletId,
                    nonce: nonce,
                }
            })
        }

        if (user) {
            const message = [
                {
                    type: "string",
                    name: "Dia",
                    value: `Welcome to surveylatte!
    
                    To log in to your surveylatte dashboard, tap the sign button. This signature request is an additional layer of security and won't cost you a penny.
    
                    ${nonce}`,
                },
            ];

            return response.status(200).json({
                data: message,
            })
        }
        else {
            return response.status(400).json('An error accrued, Please try again')
        }
    }
    catch (error) {
        console.log(error);
        return response.status(400).json('An error accrued, Please try again')
    }
}

async function walletVerify(request, response) {
    try {
        const { walletId, signature } = request.body;

        if (!walletId || !signature) {
            return response.status(400).json('All inputs are required')
        }

        const user = await prisma.user.findFirstOrThrow({
            where: {
                wallet_id: walletId,
            },
            select: {
                nonce: true,
            }
        });
        const nonce = user.nonce
        const message = [
            {
                type: "string",
                name: "Dia",
                value: `Welcome to surveylatte!
                    To log in to your surveylatte dashboard, tap the sign button. This signature request is an additional layer of security and won't cost you a penny.
                    ${nonce}`,
            },
        ];

        const recoveredWalletId = sigUtil.recoverTypedSignature({
            data: message,
            signature: signature,
            version: "V1",
        });
        if (recoveredWalletId === walletId.toLowerCase()) {
            let user = await prisma.user.findFirst({
                where: {
                    wallet_id: walletId,
                }
            });
            if (!user) {
                return response.status(400).json('User not found!')
            }
            user.token = jwt.sign(
                {
                    wallet_id: walletId,
                    user_id: user.id,
                },
                process.env.ACCOUNT_TOKEN_KEY,
                {
                    expiresIn: process.env.ACCOUNT_TOKEN_EXPIRE_TIME,
                }
            );

            response.status(200).json(user)
        }
        else {
            return response.status(400).json('Invalid information. Please try again')
        }
    }
    catch (error) {
        // console.log(error);
        return response.status(400).json('An error accrued, Please try again')
    }
}


module.exports = {
    walletLogin,
    walletVerify
}

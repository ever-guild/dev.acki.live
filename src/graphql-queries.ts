export const GetAccountQuery = `
    query GetAccount($address: String!) {
        account(address: $address) {
            info {
                boc
            }
        }
    }
`
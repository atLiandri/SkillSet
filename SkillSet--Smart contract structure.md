
inspired by [this](https://github.com/lxdao-official/MarryMe-Contract/blob/e03dbf19650c4c3974701cc52ced1e9b889add1c/src/MarryMe.sol) marryme contract
Attestation Sign contract : [Attestation.sol](https://github.com/EthSign/sign-protocol-evm/blob/main/src/models/Attestation.sol),  
[An example of interaction with Sign](https://docs.sign.global/for-builders/getting-started/index/building-a-simple-notary-platform) 

### Main idea:
certificates can be issued via our contract using Sign protocol attestations, according to various schemas we will develop. Our contract indexes the certificates using a proper variable, so that such certificates can then be queried thanks to the view methods of the contract. As an example the variable in the contract could be a map addresses -->issued certificates and a map addresses --> received certificates. A third map points from certificates IDs to tags. Tags are created when certificates are first issued, but can be later updated by the issuer or the receiver. From frontend the user can filter certificates based on their tag. From frontend users can also gain additional information, e.g. the amount of people possessing a given certificate, and so on.

In particular, from frontend it will be possible to query "friend" addresses, which are addresses who received a Skill certificate from us. In addition, we can query our friend for a particular Skill tag. If we will have enough time, it would be awesome to then be able to query second or third-degree friends following chains of Skill attestations, so that we can look for a person with a particular skillset in our network. 

Data location for the project will be totally onchain, since it is easier to code and our application is not data intensive so it makes sense.
### Schemas:
 [learn about schema creation here](https://docs.sign.global/for-builders/getting-started/index/building-a-simple-notary-platform/schema-creation)
Certifications are divided into some big groups, that differ for the schema used. Schemas differ from tags because each certificate belongs to a different schema, and its data structure is defined by the schema. On the other hand, a certification can have multiple tags, and they can also be updated after issuance. 
We can update the contract schemas (updating contract schemas variables in the smart contract). 
Example of possible schemas: Skill, Professional Certificate, Recommendation Letter,  Game Achievement.
An "issuers" and "description" field will probably be present for all schemas
1. Skill schema (used for skill recognition by friends or colleagues, as in LinkedIn, or by teammates. In general is informal): 
	- Level
2. Game Achievement schema (used for games or even real life experiences that have game-like features, or events that want to issue a participation certificate)
	- Game
	- Location (for real life experiences, while games could use servers or whatever)
	- Date when achievement has been completed (could differ from the blockchain timestamp)
3. Recommendation Letter
	- Letter Text
	- expiration
4. Professional certificate
	- name of the certificate
	- Date 
	- expiration

## Methods
- `registerCertificate`: sign an attestation to a target ptf, using a given schema. 
- `registerCertificateProposal`: used when a certificate requires a confirmation or an action by receiver to be registered on chain. Creates a "proposal" object that will be later accessed by the receiver when he will call confirmCertificate. The caller of registerCertificateProposal can also require money to be sent together with the confirmation
- `deleteCertificateProposal`: delete a proposal that has not been signed yet
- `confirmCertificate`: sign a received certificate proposal
- `addTagToCertificate`: can be called by issuer or receiver on old certificate to add additional tags. Requires the certificate id, updates the map certificate->tags
Several view functions will be needed, also a couple events probably

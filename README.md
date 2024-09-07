# SkillSet
The SkillSet platform unifies all statements and opinions regarding a person's skills. Statements are concretized via on-chain attestations, making them permanent and easily retrievable. The skills possessed by a person and the attesters of such skills can be consulted by any user.

## The possible applications comprise registering
1. professional certificates (language certificates, university degrees,...)
2. gaming achievements (level reached, badges, ....)
3. Personal believes regarding a person ("9/10 Solidity programmer", ... )

## Relevant features:
- SkillSet requires users confirmation to register received certification proposal. Each user has control over which certifications will be registered at her name.
- SkillSet makes use of Sign protocol schema hooks to limit the amount of certifications that can be received by a user in a given period of time. This frequency cap effectively act as a "certification-relevance toggle", that disincentivize over-certification. The actual rate depends on the particular schema (different for a gaming or a professional scenario). 

## Future vision:
- Implementation of various schemas depending on the particular skill category (professional, gaming, personal belief)
- Skill certifications possess additional tags that make querying them easier. 
- Certifications effectively build a network whose connections go from Issuer to Receiver. The network can be queried from frontend to look for a skilled person in a particular field whose ability have been attested by someone we trust. Effectively brings on chain Linkedin-style skill attestations.  

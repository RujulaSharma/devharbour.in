const express=require('express');const {requireAuth}=require('../auth');const {rateLimit}=require('../rate-limiter');const {csrf}=require('../profile/policy');const db=require('../db');const {pool}=require('../db-postgres');const router=express.Router();const EVENT='innovative-india-2026';
router.use(requireAuth,csrf,rateLimit({windowMs:60000,max:20}));router.use((req,res,next)=>{res.set('Cache-Control','private, no-store');next()});
async function owned(req){
 const email=req.user.email.trim().toLowerCase();
 const p=await db.findParticipantByEmail(email,EVENT);
 if(!p||![1,true].includes(p.is_eligible))throw Object.assign(Error('Your verified email is not on the Innovative India list.'),{status:403});
 const database=db.getCertificateDatabase(),session=await database.getSession(req.token);
 if(email.endsWith('@gmail.com')&&session?.google_verified_email!==email)throw Object.assign(Error('Continue with Google using your registered Gmail address.'),{status:403});
 const user=await database.getUserById(req.user.id);
 const c=await require('../innovative_certificates').issueCertificate(database,user,null);
 if(!c)throw Object.assign(Error('Certificate unavailable.'),{status:403});
 return c;
}
router.get('/',async(req,res,next)=>{try{const c=await owned(req);res.json({id:c.credential_id,name:c.recipient_name,event:'INNOVATIVE INDIA 2026',date:c.issue_date,verificationUrl:'/verify-certificate?id='+encodeURIComponent(c.credential_id)})}catch(e){next(e)}});
router.patch('/name',async(req,res,next)=>{try{const name=typeof req.body.name==='string'?req.body.name.trim().normalize('NFC'):'';if(name.length<2||name.length>100||/[\x00-\x1f<>]/.test(name))return res.status(400).json({error:'Enter a name between 2 and 100 characters.'});const c=await owned(req);await pool.query('UPDATE issued_certificates SET recipient_name=$1 WHERE credential_id=$2 AND lower(recipient_email)=$3 AND event_slug=$4',[name,c.credential_id,req.user.email.toLowerCase(),EVENT]);res.json({name})}catch(e){next(e)}});
router.get('/pdf',async(req,res,next)=>{try{const c=await owned(req);const bytes=await require('../certificate_generator').generateCertificatePdf({recipientName:c.recipient_name,credentialId:c.credential_id});res.type('pdf').set('Content-Disposition','attachment; filename="Innovative-India-Participation.pdf"').send(Buffer.from(bytes))}catch(e){next(e)}});
router.use((e,req,res,next)=>{if(e.code==='CERTIFICATE_FONT_COVERAGE')return res.status(422).json({error:e.message});res.status(e.status||500).json({error:e.status?e.message:'Certificate service unavailable.'})});module.exports=router;

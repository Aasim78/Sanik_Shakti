import axios from 'axios';
import { storage } from '../storage';
import { AadhaarVerificationRequest, AadhaarVerificationResponse } from '@shared/schema';
import { createHash } from 'crypto';

const UIDAI_BASE_URL = process.env.UIDAI_BASE_URL || 'https://stage1.uidai.gov.in/unifiedAppAuthService/api/v2';
const UIDAI_API_KEY = process.env.UIDAI_API_KEY;
const UIDAI_ASA_LICENSE_KEY = process.env.UIDAI_ASA_LICENSE_KEY;

if (!UIDAI_API_KEY || !UIDAI_ASA_LICENSE_KEY) {
  console.error('UIDAI API credentials not configured!');
}

export class AadhaarService {
  private async generateTxnId(): Promise<string> {
    return `SAINIK-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private async logVerificationAttempt(request: AadhaarVerificationRequest, status: string, error?: string, txnId?: string) {
    try {
      await storage.createAadhaarVerificationLog({
        aadhaarNumber: request.aadhaarNumber,
        verificationType: request.verificationType,
        verificationStatus: status,
        errorMessage: error,
        txnId: txnId || "",
        ipAddress: '', // To be filled by route handler
        userAgent: '', // To be filled by route handler
      });
    } catch (error) {
      console.error('Failed to log verification attempt:', error);
    }
  }

  async initiateVerification(request: AadhaarVerificationRequest): Promise<AadhaarVerificationResponse> {
    const txnId = await this.generateTxnId();

    try {
      // Hash Aadhaar number for security
      const hashedAadhaar = createHash('sha256').update(request.aadhaarNumber).digest('hex');

      const payload = {
        uid: hashedAadhaar,
        txnId: txnId,
        consent: 'Y',
        certificateType: request.verificationType === 'BIOMETRIC' ? 'X509' : 'NA',
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': UIDAI_API_KEY,
        'X-ASA-LICENSE-KEY': UIDAI_ASA_LICENSE_KEY,
      };

      const response = await axios.post(
        `${UIDAI_BASE_URL}/generate-otp`,
        payload,
        { headers }
      );

      if (response.data.status === 'Success') {
        await this.logVerificationAttempt(request, 'OTP_SENT', undefined, txnId);
        return {
          success: true,
          verified: false,
          txnId: txnId || "",
        };
      } else {
        throw new Error(response.data.message || 'Failed to initiate verification');
      }
    } catch (error: any) {
      await this.logVerificationAttempt(
        request,
        'FAILED',
        error.message || 'Unknown error',
        txnId
      );
      return {
        success: false,
        verified: false,
        error: error.message || 'Verification failed',
        txnId: txnId || "",
      };
    }
  }

  async verifyOTP(request: AadhaarVerificationRequest): Promise<AadhaarVerificationResponse> {
    if (!request.otp) {
      throw new Error('OTP is required');
    }

    try {
      const payload = {
        txnId: request.txnId,
        otp: request.otp,
        uid: createHash('sha256').update(request.aadhaarNumber).digest('hex'),
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': UIDAI_API_KEY,
        'X-ASA-LICENSE-KEY': UIDAI_ASA_LICENSE_KEY,
      };

      const response = await axios.post(
        `${UIDAI_BASE_URL}/verify-otp`,
        payload,
        { headers }
      );

      if (response.data.status === 'Success') {
        await this.logVerificationAttempt(request, 'VERIFIED', undefined, request.txnId);
        return {
          success: true,
          verified: true,
          aadhaarHolder: {
            name: response.data.name,
            dateOfBirth: response.data.dob,
            gender: response.data.gender,
            address: response.data.address,
            photo: response.data.photo,
          },
          txnId: request.txnId || "",
        };
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error: any) {
      await this.logVerificationAttempt(
        request,
        'FAILED',
        error.message || 'Unknown error',
        request.txnId
      );
      return {
        success: false,
        verified: false,
        error: error.message || 'OTP verification failed',
        txnId: request.txnId || "",
      };
    }
  }

  async verifyBiometric(request: AadhaarVerificationRequest): Promise<AadhaarVerificationResponse> {
    if (!request.biometricData) {
      throw new Error('Biometric data is required');
    }

    try {
      const payload = {
        txnId: request.txnId,
        uid: createHash('sha256').update(request.aadhaarNumber).digest('hex'),
        biometricData: request.biometricData,
        certificateType: 'X509',
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': UIDAI_API_KEY,
        'X-ASA-LICENSE-KEY': UIDAI_ASA_LICENSE_KEY,
      };

      const response = await axios.post(
        `${UIDAI_BASE_URL}/verify-biometric`,
        payload,
        { headers }
      );

      if (response.data.status === 'Success') {
        await this.logVerificationAttempt(request, 'VERIFIED', undefined, request.txnId);
        return {
          success: true,
          verified: true,
          aadhaarHolder: {
            name: response.data.name,
            dateOfBirth: response.data.dob,
            gender: response.data.gender,
            address: response.data.address,
            photo: response.data.photo,
          },
          txnId: request.txnId || "",
        };
      } else {
        throw new Error(response.data.message || 'Biometric verification failed');
      }
    } catch (error: any) {
      await this.logVerificationAttempt(
        request,
        'FAILED',
        error.message || 'Unknown error',
        request.txnId
      );
      return {
        success: false,
        verified: false,
        error: error.message || 'Biometric verification failed',
        txnId: request.txnId || "",
      };
    }
  }
} 
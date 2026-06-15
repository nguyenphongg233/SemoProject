import { useState, useRef, useEffect } from 'react'
import type { SyntheticEvent, ChangeEvent } from 'react'
import {
  User, Mail, ShieldCheck, Lock, KeyRound, Eye, EyeOff, Save, Camera
} from 'lucide-react'

import { SectionHeader, Alert, Button, Card, TextField } from '@/components'
import { useAuth } from '@/hooks/useAuth'
import { changePassword, updateProfile, uploadAvatar } from '@/features/users'
import { login as loginApi } from '@/features/auth/api'
import { getApiErrorMessage } from '@/utils'

export default function AccountPage() {
  const { user, updateUser } = useAuth()
  
  // Local state for forms
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')

  // Sync form fields when user object changes (e.g. after loading)
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setEmail(user.email || '')
    }
  }, [user])
  
  // Confirmation password to save profile
  const [profilePassword, setProfilePassword] = useState('')
  const [showProfilePassword, setShowProfilePassword] = useState(false)
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  // Status state
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPwd, setLoadingPwd] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load avatar from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedAvatar = localStorage.getItem(`semo_avatar_${user.id}`)
      if (savedAvatar) {
        setAvatarPreview(savedAvatar)
      }
    }
  }, [user?.id])

  // Profile update handler
  async function handleProfileUpdate(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoadingProfile(true)
    setError('')
    setSuccess('')

    try {
      if (!user?.id) {
        setError('Current user account could not be determined.')
        return
      }
      if (!profilePassword) {
        setError('Confirm password is required to update info.')
        return
      }
      
      // Verify password by attempting to login
      try {
        await loginApi({ email: user.email, password: profilePassword })
      } catch (err) {
        setError('Confirm password does not match.')
        setLoadingProfile(false)
        return
      }
      
      // Update via user-specific API
      await updateProfile({
        fullName,
        email
      })
      
      // Update global context ONLY if API succeeds
      updateUser({ ...user, fullName, email })
      setSuccess('Profile information updated successfully.')
      setProfilePassword('') // Reset field
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Error updating profile.'))
    } finally {
      setLoadingProfile(false)
    }
  }

  // Password update handler
  async function handlePasswordChange(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoadingPwd(true)
    setError('')
    setSuccess('')

    try {
      if (!user?.id) {
        setError('Current user account could not be determined.')
        return
      }
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters long.')
        return
      }
      await changePassword({ currentPassword, newPassword })
      setSuccess('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to change password.'))
    } finally {
      setLoadingPwd(false)
    }
  }

  // Avatar upload handler
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB.')
      return
    }

    try {
      // Gọi API thực tế của backend để upload ảnh vào thư mục uploads/avatars
      const response = await uploadAvatar(file)
      // UploadResponseDTO trả về url
      const fileUrl = response.url

      if (fileUrl) {
        setAvatarPreview(fileUrl)
        if (user?.id) {
          // Lưu đường dẫn ảnh vào localStorage để hiển thị vì DB hiện tại chưa có trường avatar
          localStorage.setItem(`semo_avatar_${user.id}`, fileUrl)
          setSuccess('Avatar uploaded successfully to server.')
          
          // Clear message after 3s
          setTimeout(() => setSuccess(''), 3000)
        }
      } else {
        setError('Upload failed: No file URL returned from server.')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to upload avatar to server.'))
    }
  }

  const eyeBtn = (
    visible: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    label: string
  ) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => setter((v) => !v)}
      className="bg-transparent border-0 text-slate-400 hover:text-white cursor-pointer grid place-items-center p-0 transition-colors"
    >
      {visible ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
    </button>
  )

  return (
    <div className="grid gap-6 pb-10">
      <SectionHeader
        eyebrow="Personal Profile"
        title="Account Settings"
        description="Update your personal details, avatar, and security preferences."
      />
      
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="flex max-lg:flex-col gap-6 items-start">
        
        {/* Left Column: Avatar & Profile Info */}
        <div className="flex-1 grid gap-6 w-full">
          <Card className="rounded-3xl border-white/5 bg-slate-900/50 backdrop-blur-md p-6">
            <SectionHeader
              eyebrow="Profile"
              title="Personal Information"
              description="Manage your identity and contact details."
              actions={<User size={20} strokeWidth={1.7} className="text-cyan-400" />}
            />
            
            <div className="mt-8 mb-6 flex flex-col items-center">
              <div 
                className="relative w-32 h-32 rounded-full group cursor-pointer border-4 border-slate-800 shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center transition-transform hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-500" />
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-xs font-bold text-white">Change</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
              <p className="text-xs text-slate-400 mt-3">Click avatar to upload (Max 2MB)</p>
            </div>

            <form className="grid gap-5" onSubmit={handleProfileUpdate}>
              <TextField
                label="Full Name"
                name="fullName"
                value={fullName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                leadingIcon={<User size={18} strokeWidth={1.7} />}
              />

              <TextField
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                leadingIcon={<Mail size={18} strokeWidth={1.7} />}
              />

              <TextField
                label="Account Role"
                value={user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                disabled
                leadingIcon={<ShieldCheck size={18} strokeWidth={1.7} />}
                helpText="Your role determines your access permissions and cannot be changed here."
              />

              <div className="pt-2 border-t border-white/10 mt-2">
                <TextField
                  label="Confirm Password to Save"
                  type={showProfilePassword ? 'text' : 'password'}
                  name="profilePassword"
                  value={profilePassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setProfilePassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  leadingIcon={<Lock size={18} strokeWidth={1.7} />}
                  trailingAction={eyeBtn(showProfilePassword, setShowProfilePassword, 'Show/Hide Confirm Password')}
                  helpText="Required to verify your identity before saving profile changes."
                />
              </div>

              <Button
                type="submit"
                disabled={loadingProfile || (!fullName && !email) || !profilePassword}
                className="rounded-xl h-12 bg-cyan-600 hover:bg-cyan-500 text-white border-none shadow-[0_0_15px_rgba(8,145,178,0.3)] mt-2"
                leadingIcon={<Save size={18} strokeWidth={1.8} />}
              >
                {loadingProfile ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Security */}
        <div className="w-[420px] max-lg:w-full shrink-0">
          <Card className="rounded-3xl border-white/5 bg-slate-900/50 backdrop-blur-md p-6 sticky top-6">
            <SectionHeader
              eyebrow="Security"
              title="Change Password"
              description="Update your password regularly to keep your account secure."
              actions={<ShieldCheck size={20} strokeWidth={1.7} className="text-cyan-400" />}
            />

            <form className="grid gap-5 mt-6" onSubmit={handlePasswordChange}>
              <TextField
                label="Current Password"
                type={showCurrent ? 'text' : 'password'}
                name="currentPassword"
                value={currentPassword}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setCurrentPassword(event.target.value)}
                required
                leadingIcon={<Lock size={18} strokeWidth={1.7} />}
                trailingAction={eyeBtn(showCurrent, setShowCurrent, 'Show/Hide Current Password')}
              />
              
              <TextField
                label="New Password"
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                value={newPassword}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)}
                required
                leadingIcon={<KeyRound size={18} strokeWidth={1.7} />}
                trailingAction={eyeBtn(showNew, setShowNew, 'Show/Hide New Password')}
                helpText="Minimum 8 characters. For better security, use uppercase, lowercase and numbers."
              />
              
              <Button
                type="submit"
                disabled={loadingPwd || !currentPassword || !newPassword}
                variant="secondary"
                className="rounded-xl h-12 mt-2"
                leadingIcon={<ShieldCheck size={18} strokeWidth={1.8} />}
              >
                {loadingPwd ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </div>
  )
}

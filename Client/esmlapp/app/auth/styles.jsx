import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    color: 'white',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 16,
    color: 'white',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  smsButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    marginHorizontal: 8,
  },
  smsButtonText: {
    color: 'white',
    fontSize: 16,
  },
  emailButton: {
    backgroundColor: '#facc15',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    marginHorizontal: 8,
  },
  emailButtonText: {
    color: 'black',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#e5e7eb',
    color: 'black',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  resendText: {
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    marginTop: 16,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 16,
  },
  cancelText: {
    color: '#9ca3af',
  },
});

export default styles;
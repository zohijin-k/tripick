import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const MAX_COMMENT = 80;

interface Props {
  visible: boolean;
  courseTitle: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

function StarRating({
  rating,
  onSelect,
}: {
  rating: number;
  onSelect: (r: number) => void;
}) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onSelect(n)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[starStyles.star, n <= rating && starStyles.starFilled]}>
            {n <= rating ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  star: {
    fontSize: 36,
    color: '#dce6ec',
  },
  starFilled: {
    color: '#f59e0b',
  },
});

const RATING_LABELS: Record<number, string> = {
  1: '아쉬워요',
  2: '별로예요',
  3: '보통이에요',
  4: '좋았어요',
  5: '최고예요!',
};

export function ReviewModal({ visible, courseTitle, onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const canSubmit = rating > 0;

  function handleClose() {
    setRating(0);
    setComment('');
    onClose();
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(rating, comment.trim());
    setRating(0);
    setComment('');
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.heading}>코스 리뷰 남기기</Text>
          <Text style={styles.subheading} numberOfLines={1}>{courseTitle}</Text>

          {/* Stars */}
          <StarRating rating={rating} onSelect={setRating} />

          {rating > 0 && (
            <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
          )}

          {/* Comment input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="한 줄 후기를 작성하세요 (선택)"
              placeholderTextColor="#8a9db0"
              value={comment}
              onChangeText={setComment}
              maxLength={MAX_COMMENT}
              multiline={false}
              returnKeyType="done"
            />
            <Text style={styles.charCount}>
              {comment.length}/{MAX_COMMENT}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={[styles.submitBtnText, !canSubmit && styles.submitBtnTextDisabled]}>
                리뷰 저장하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#dce6ec',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#13315c',
    textAlign: 'center',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: '#5c6b7a',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: -4,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#dce6ec',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    marginTop: 8,
    backgroundColor: '#f8fafc',
  },
  input: {
    fontSize: 14,
    color: '#13315c',
    paddingVertical: 0,
  },
  charCount: {
    fontSize: 11,
    color: '#8a9db0',
    textAlign: 'right',
    marginTop: 6,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
  submitBtn: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#0f8b6d',
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  submitBtnTextDisabled: {
    color: 'rgba(255,255,255,0.6)',
  },
});

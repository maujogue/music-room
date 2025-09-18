'use client';
import React from 'react';
import {
  Pressable,
  View,
  Dimensions,
  ViewStyle,
  Modal,
} from 'react-native';
import {
  Motion,
  AnimatePresence,
  createMotionAnimatedComponent,
  MotionComponentProps,
} from '@legendapp/motion';

type IAnimatedPressableProps = React.ComponentProps<typeof Pressable> &
  MotionComponentProps<typeof Pressable, ViewStyle, unknown, unknown, unknown>;

const AnimatedPressable = createMotionAnimatedComponent(
  Pressable
) as React.ComponentType<IAnimatedPressableProps>;

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const sizes: { [key: string]: number } = {
  sm: 0.25,
  md: 0.5,
  lg: 0.75,
  full: 1,
};

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

// Context pour partager les props entre les composants
const DrawerContext = React.createContext<{
  size?: string;
  anchor?: string;
  isOpen?: boolean;
  onClose?: () => void;
}>({});

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'full';
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
  children: React.ReactNode;
}

const Drawer = React.forwardRef<View, DrawerProps>(
  function Drawer({ isOpen, onClose, size = 'sm', anchor = 'bottom', className, children }, _ref) {
    return (
      <DrawerContext.Provider value={{ size, anchor, isOpen, onClose }}>
        <Modal
          visible={isOpen}
          transparent
          animationType="none"
          onRequestClose={onClose}
        >
          <View
            className={`w-full h-full relative ${className || ''}`}
            style={{ flex: 1 }}
          >
            <AnimatePresence>
              {isOpen && children}
            </AnimatePresence>
          </View>
        </Modal>
      </DrawerContext.Provider>
    );
  }
);

interface DrawerBackdropProps {
  className?: string;
  onPress?: () => void;
}

const DrawerBackdrop = React.forwardRef<View, DrawerBackdropProps>(
  function DrawerBackdrop({ className, onPress }, ref) {
    const { onClose } = React.useContext(DrawerContext);

    return (
      <AnimatedPressable
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{
          type: 'timing',
          duration: 250,
        }}
        onPress={onPress || onClose}
        className={`absolute inset-0 bg-black ${className || ''}`}
      />
    );
  }
);

interface DrawerContentProps {
  className?: string;
  children: React.ReactNode;
}

const DrawerContent = React.forwardRef<View, DrawerContentProps>(
  function DrawerContent({ className, children }, ref) {
    const { size = 'sm', anchor = 'bottom' } = React.useContext(DrawerContext);

    const drawerHeight = screenHeight * (sizes[size] || sizes.sm);
    const drawerWidth = screenWidth * (sizes[size] || sizes.sm);

    const isHorizontal = anchor === 'left' || anchor === 'right';

    const initialObj = isHorizontal
      ? { x: anchor === 'left' ? -drawerWidth : drawerWidth }
      : { y: anchor === 'top' ? -drawerHeight : drawerHeight };

    const animateObj = isHorizontal ? { x: 0 } : { y: 0 };

    const exitObj = isHorizontal
      ? { x: anchor === 'left' ? -drawerWidth : drawerWidth }
      : { y: anchor === 'top' ? -drawerHeight : drawerHeight };

    // Classes CSS basées sur la position
    let positionClasses = '';
    let sizeClasses = '';

    if (isHorizontal) {
      positionClasses = `top-0 h-full ${anchor === 'left' ? 'left-0' : 'right-0'}`;
      sizeClasses = size === 'sm' ? 'w-1/4' : size === 'md' ? 'w-1/2' : size === 'lg' ? 'w-3/4' : 'w-full';
    } else {
      positionClasses = `left-0 w-full ${anchor === 'top' ? 'top-0' : 'bottom-0'}`;
      // Pour les drawers verticaux, on ne fixe pas la hauteur pour qu'elle s'adapte au contenu
      sizeClasses = '';
    }

    return (
      <MotionView
        ref={ref}
        initial={initialObj}
        animate={animateObj}
        exit={exitObj}
        transition={{
          type: 'timing',
          duration: 300,
        }}
        className={`bg-white p-6 absolute ${positionClasses} ${sizeClasses} ${className || ''}`}
        style={{ position: 'absolute' }}
      >
        {children}
      </MotionView>
    );
  }
);

interface DrawerHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const DrawerHeader = React.forwardRef<View, DrawerHeaderProps>(
  function DrawerHeader({ className, children }, ref) {
    return (
      <View
        ref={ref}
        className={`flex-row justify-between items-center ${className || ''}`}
      >
        {children}
      </View>
    );
  }
);

interface DrawerBodyProps {
  className?: string;
  children: React.ReactNode;
  contentContainerClassName?: string;
}

const DrawerBody = React.forwardRef<View, DrawerBodyProps>(
  function DrawerBody({ className, contentContainerClassName, children }, ref) {
    return (
      <View
        ref={ref}
        className={`mt-4 mb-6 ${className || ''} ${contentContainerClassName || ''}`}
      >
        {children}
      </View>
    );
  }
);

interface DrawerFooterProps {
  className?: string;
  children: React.ReactNode;
}

const DrawerFooter = React.forwardRef<View, DrawerFooterProps>(
  function DrawerFooter({ className, children }, ref) {
    return (
      <View
        ref={ref}
        className={`flex-row justify-end items-center ${className || ''}`}
      >
        {children}
      </View>
    );
  }
);

interface DrawerCloseButtonProps {
  className?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}

const DrawerCloseButton = React.forwardRef<Pressable, DrawerCloseButtonProps>(
  function DrawerCloseButton({ className, children, onPress }, ref) {
    const { onClose } = React.useContext(DrawerContext);

    return (
      <Pressable
        ref={ref}
        onPress={onPress || onClose}
        className={`z-10 rounded p-2 ${className || ''}`}
      >
        {children}
      </Pressable>
    );
  }
);

Drawer.displayName = 'Drawer';
DrawerBackdrop.displayName = 'DrawerBackdrop';
DrawerContent.displayName = 'DrawerContent';
DrawerHeader.displayName = 'DrawerHeader';
DrawerBody.displayName = 'DrawerBody';
DrawerFooter.displayName = 'DrawerFooter';
DrawerCloseButton.displayName = 'DrawerCloseButton';

export {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
};
